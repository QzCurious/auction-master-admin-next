import assert from 'node:assert/strict';
import { test } from 'node:test';

import { MutationObserver, QueryObserver } from '@tanstack/react-query';

import { ActionResultError, requireActionSuccess } from '../src/domain/data/actionResult';
import { affectsQuery, mutationEffects } from '../src/domain/data/freshness';
import { shouldPoll } from '../src/domain/data/polling';
import { createQueryClient } from '../src/domain/data/queryClient';

void test('failed action envelopes are query failures with original feedback, never cached as success', async () => {
  const feedback: string[] = [];
  const client = createQueryClient((error) => feedback.push(error.code));
  const failure = { data: null, error: { type: 'toast' as const, code: '1001', message: '沒有權限' } };
  let attempts = 0;
  await assert.rejects(
    client.fetchQuery({
      queryKey: ['items', 1],
      queryFn: () => {
        attempts++;
        return requireActionSuccess(Promise.resolve(failure));
      },
    }),
    ActionResultError
  );
  assert.equal(client.getQueryState(['items', 1])?.status, 'error');
  assert.equal(client.getQueryData(['items', 1]), undefined);
  assert.deepEqual(feedback, ['1001']);
  assert.equal(attempts, 1);
  client.clear();
});

void test('successful shipping invalidates all affected query variants and refetches active detail', async () => {
  const client = createQueryClient(() => {});
  const keys = [
    ['auction-items', 1],
    ['items', 2],
    ['/reports/records', { offset: 0 }],
    ['/reports/records/summary'],
    ['reports'],
    ['GetWorkers'],
  ];
  for (const key of keys) client.setQueryData(key, 'before');
  let reads = 0;
  const observer = new QueryObserver(client, {
    queryKey: keys[0],
    queryFn: async () => {
      reads++;
      return 'after';
    },
    staleTime: Infinity,
  });
  const unsubscribe = observer.subscribe(() => {});
  const mutation = new MutationObserver(client, {
    mutationFn: () => requireActionSuccess(Promise.resolve({ data: 'ok', error: undefined })),
    onSuccess: () => client.invalidateQueries({ predicate: (q) => affectsQuery('ShippingAuctionItem', q.queryKey) }),
  });
  await mutation.mutate(undefined);
  assert.equal(reads, 1);
  assert.equal(client.getQueryData(keys[0]), 'after');
  for (const key of keys.slice(1, -1)) assert.equal(client.getQueryState(key)?.isInvalidated, true);
  assert.equal(client.getQueryState(keys.at(-1)!)?.isInvalidated, false);
  assert.ok(mutationEffects.ShippingAuctionItem.includes('shippings'));
  assert.deepEqual(mutationEffects.HandleConsignorVerification, ['consignorsVerifications', 'consignors']);
  assert.ok(mutationEffects.AddPermissionForRole.includes('admins'));
  unsubscribe();
  client.clear();
});

void test('failed mutations enter error state without invalidation or success effects', async () => {
  const client = createQueryClient(() => {});
  client.setQueryData(['GetWorkers'], 'original');
  let successes = 0;
  const mutation = new MutationObserver(client, {
    mutationFn: () =>
      requireActionSuccess(
        Promise.resolve({ data: null, error: { type: 'toast' as const, code: '1100', message: '查無 worker id' } })
      ),
    onSuccess: async () => {
      successes++;
      await client.invalidateQueries();
    },
  });
  await assert.rejects(mutation.mutate(undefined), ActionResultError);
  assert.equal(mutation.getCurrentResult().status, 'error');
  assert.equal(successes, 0);
  assert.equal(client.getQueryState(['GetWorkers'])?.isInvalidated, false);
  client.clear();
});

void test('background refresh failure retains last successful data and reports failure', async () => {
  const feedback: string[] = [];
  const client = createQueryClient((error) => feedback.push(error.code));
  client.setQueryData(['items', 1], { data: { name: 'last known' } });
  await assert.rejects(
    client.fetchQuery({
      queryKey: ['items', 1],
      staleTime: 0,
      queryFn: () =>
        requireActionSuccess(Promise.resolve({ error: { type: 'toast' as const, code: '9999', message: '系統錯誤' } })),
    })
  );
  assert.deepEqual(client.getQueryData(['items', 1]), { data: { name: 'last known' } });
  assert.deepEqual(feedback, ['9999']);
  client.clear();
});

void test('polling pauses when hidden, refreshing, editing, or selecting and resumes only when idle', () => {
  const idle = { visible: true, pending: false, editing: false, picking: false };
  assert.equal(shouldPoll(idle), true);
  for (const state of [{ visible: false }, { pending: true }, { editing: true }, { picking: true }]) {
    assert.equal(shouldPoll({ ...idle, ...state }), false);
  }
});

void test('every mapped server mutation invalidates only after success and client calls use the mutation adapter', async () => {
  const { readFile, readdir } = await import('node:fs/promises');
  const path = await import('node:path');
  const ts = await import('typescript');
  async function files(dir: string): Promise<string[]> {
    const entries = await readdir(dir, { withFileTypes: true });
    return (
      await Promise.all(
        entries.map((entry) => (entry.isDirectory() ? files(path.join(dir, entry.name)) : [path.join(dir, entry.name)]))
      )
    ).flat();
  }
  const actions = await files('src/server-action/backend');
  for (const name of Object.keys(mutationEffects)) {
    const file = actions.find((file) => path.basename(file) === `${name}.ts`);
    assert.ok(file, name);
    assert.match(await readFile(file, 'utf8'), new RegExp(`if \\(!res.error\\) revalidateMutation\\('${name}'\\)`));
  }
  for (const file of (await files('src/app')).filter((file) => file.endsWith('.tsx'))) {
    const text = await readFile(file, 'utf8');
    const source = ts.createSourceFile(file, text, ts.ScriptTarget.Latest, true, ts.ScriptKind.TSX);
    function visit(node: import('typescript').Node) {
      if (ts.isCallExpression(node) && ts.isIdentifier(node.expression) && node.expression.text in mutationEffects) {
        let parent = node.parent;
        while (parent && !(ts.isCallExpression(parent) && parent.expression.getText(source) === 'runApiMutation'))
          parent = parent.parent;
        assert.ok(parent, `${file}: ${node.expression.text} bypasses client invalidation`);
      }
      ts.forEachChild(node, visit);
    }
    visit(source);
  }
});
