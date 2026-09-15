import assert from 'node:assert/strict';
import { test } from 'node:test';

import { MutationObserver } from '@tanstack/react-query';

import { ActionResultError, requireActionSuccess } from '../src/domain/data/actionResult';
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

void test('server mutations revalidate directly after both successful and failed upstream results', async () => {
  const { readFile, readdir } = await import('node:fs/promises');
  const path = await import('node:path');
  const { runInNewContext } = await import('node:vm');
  const ts = await import('typescript');
  async function files(dir: string): Promise<string[]> {
    const entries = await readdir(dir, { withFileTypes: true });
    return (
      await Promise.all(
        entries.map((entry) => {
          const file = path.join(dir, entry.name);
          return entry.isDirectory() ? files(file) : [file];
        })
      )
    ).flat();
  }
  let checked = 0;
  for (const file of await files('src/server-action/backend')) {
    const source = await readFile(file, 'utf8');
    if (!source.includes("from 'next/cache'")) continue;
    const tags: string[] = [];
    let fail = false;
    const result = { data: 'saved', error: undefined };
    const failure = { data: null, error: { code: '9999' } };
    const exports: Record<string, (...args: unknown[]) => Promise<unknown>> = {};
    const code = ts.transpileModule(source, {
      compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2022 },
    }).outputText;
    runInNewContext(code, {
      exports,
      require: (name: string) => {
        if (name === 'next/cache') return { revalidateTag: (tag: string) => tags.push(tag) };
        if (name.startsWith('@/api/'))
          return new Proxy(
            {},
            {
              get: () => async () => {
                if (fail) throw new Error('upstream unavailable');
                return result;
              },
            }
          );
        if (name.endsWith('/createActionApi')) return { createActionApi: () => ({}) };
        if (name.endsWith('/createApiErrorServerSide')) return { createApiErrorServerSide: () => failure };
        throw new Error(`Unexpected import: ${name}`);
      },
    });
    const action = Object.values(exports)[0];
    assert.equal(await action(), result, file);
    assert.ok(tags.length > 0, `${file}: success must invalidate`);
    const successTags = [...tags];
    tags.length = 0;
    fail = true;
    assert.equal(await action(), failure, file);
    assert.deepEqual(tags, successTags, `${file}: failure should still refresh the same tags`);
    checked++;
  }
  assert.ok(checked > 0);
});
