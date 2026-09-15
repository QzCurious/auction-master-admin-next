import assert from 'node:assert/strict';
import { createRequire } from 'node:module';
import { test } from 'node:test';

import React from 'react';
import { QueryClientProvider } from '@tanstack/react-query';
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
    const result = await hook.result.current('DeleteWorker', async () => ({
      data: null,
      error: { code: '1100', type: 'toast' as const, message: '查無 worker id' },
    }));
    assert.equal(result.error?.code, '1100');
  });
  assert.equal(client.getMutationCache().getAll().at(-1)?.state.status, 'error');
  assert.equal(client.getQueryState(['GetWorkers', { type: 'seller' }])?.isInvalidated, false);
  await act(async () => {
    await hook.result.current('UpdateWorker', async () => ({ data: 'ok', error: undefined }));
  });
  assert.equal(client.getMutationCache().getAll().at(-1)?.state.status, 'success');
  assert.equal(client.getQueryState(['GetWorkers', { type: 'seller' }])?.isInvalidated, true);

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
