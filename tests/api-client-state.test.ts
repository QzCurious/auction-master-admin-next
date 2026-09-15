import assert from 'node:assert/strict';
import { createRequire } from 'node:module';
import { test } from 'node:test';

import React from 'react';
import { QueryClientProvider, QueryObserver } from '@tanstack/react-query';
import { useForm } from 'react-hook-form';

import { createQueryClient } from '../src/domain/data/queryClient';
import { useRunApiMutation } from '../src/domain/data/useRunApiMutation';

void test('real mutation hook keeps failures out of success cache and refreshes successful workers', async () => {
  // Reuse the installed Jest jsdom environment dependency, without adding a runtime dependency.
  const require = createRequire(import.meta.url);
  const envRequire = createRequire(require.resolve('jest-environment-jsdom'));
  const { JSDOM } = envRequire('jsdom') as {
    JSDOM: new (html: string, options: { url: string }) => { window: Window & typeof globalThis };
  };
  const dom = new JSDOM('<!doctype html><html><body></body></html>', { url: 'http://localhost' });
  Object.assign(globalThis, {
    window: dom.window,
    document: dom.window.document,
    HTMLElement: dom.window.HTMLElement,
    FileList: dom.window.FileList,
  });
  Object.defineProperty(globalThis, 'navigator', { value: dom.window.navigator, configurable: true });
  const { renderHook, act, cleanup } = await import('@testing-library/react');
  const client = createQueryClient(() => {});
  const wrapper = ({ children }: { children: React.ReactNode }) =>
    React.createElement(QueryClientProvider, { client }, children);
  const hook = renderHook(() => useRunApiMutation(), { wrapper });
  client.setQueryData(['GetWorkers', { type: 'seller' }], { data: [] });
  await act(async () => {
    const result = await hook.result.current([['GetWorkers']], async () => ({
      data: null,
      error: { code: '1100', type: 'toast' as const, message: '查無 worker id' },
    }));
    assert.equal(result.error?.code, '1100');
  });
  assert.equal(client.getMutationCache().getAll().at(-1)?.state.status, 'error');
  assert.equal(client.getQueryState(['GetWorkers', { type: 'seller' }])?.isInvalidated, false);
  await act(async () => {
    await hook.result.current([['GetWorkers']], async () => ({ data: 'ok', error: undefined }));
  });
  assert.equal(client.getMutationCache().getAll().at(-1)?.state.status, 'success');
  assert.equal(client.getQueryState(['GetWorkers', { type: 'seller' }])?.isInvalidated, true);

  const recordKey = ['/reports/records', { offset: 20 }];
  const summaryKey = ['/reports/records/summary'];
  client.setQueryData(recordKey, 'old records');
  client.setQueryData(summaryKey, 'old summary');
  client.setQueryData(['items', 42], 'unrelated');
  let reads = 0;
  const observer = new QueryObserver(client, {
    queryKey: recordKey,
    queryFn: async () => {
      reads++;
      return 'fresh records';
    },
    staleTime: Infinity,
  });
  const unsubscribe = observer.subscribe(() => {});
  await act(async () => {
    await hook.result.current([['/reports/records'], ['/reports/records/summary']], async () => ({
      data: 'ok',
      error: undefined,
    }));
  });
  assert.equal(reads, 1);
  assert.equal(client.getQueryData(recordKey), 'fresh records');
  assert.equal(client.getQueryState(summaryKey)?.isInvalidated, true);
  assert.equal(client.getQueryState(['items', 42])?.isInvalidated, false);
  unsubscribe();

  const form = renderHook(
    ({ name, remark }) => {
      const methods = useForm({ values: { name, remark }, resetOptions: { keepDirtyValues: true } });
      void methods.formState.dirtyFields;
      methods.register('name');
      methods.register('remark');
      return methods;
    },
    { initialProps: { name: 'server name', remark: 'old remark' } }
  );
  act(() => form.result.current.setValue('name', 'unsaved draft', { shouldDirty: true }));
  form.rerender({ name: 'new server name', remark: 'new remark' });
  assert.equal(form.result.current.getValues('name'), 'unsaved draft');
  assert.equal(form.result.current.getValues('remark'), 'new remark');
  cleanup();
  client.clear();
  dom.window.close();
});
