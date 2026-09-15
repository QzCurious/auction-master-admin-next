import assert from 'node:assert/strict';
import { test } from 'node:test';

import { redirect } from 'next/navigation';
import ky, { HTTPError, type KyInstance } from 'ky';

import { invalidSessionError } from '../src/domain/auth/errors';
import { createApiErrorServerSide } from '../src/server/next/createApiErrorServerSide';

void test('HTTP errors retain backend codes and the existing toast/redirect shape', async () => {
  for (const [status, code, expectedCode, type] of [
    [403, '1001', '1001', 'toast'],
    [401, '1002', '1002', 'toast'],
    [401, '1003', '1003', 'redirect'],
    [400, '1113', '1113', 'toast'],
    [503, '1003', '1003', 'redirect'],
    [403, '9999', '9999', 'toast'],
  ] as const) {
    const api = ky.create({
      prefixUrl: 'https://api.example',
      retry: 0,
      redirect: 'error',
      fetch: async () => Response.json({ status: { code } }, { status }),
    });
    const result = await api.get('items').json().catch(createApiErrorServerSide);
    assert.deepEqual(result, {
      data: null,
      error:
        type === 'redirect'
          ? { code: expectedCode, type, url: '/auth/sign-in' }
          : {
              code: expectedCode,
              type,
              message:
                expectedCode === '1001'
                  ? '沒有權限'
                  : expectedCode === '1002'
                    ? '登入錯誤'
                    : expectedCode === '1113'
                      ? '請提供 item id'
                      : '系統錯誤',
            },
    });
  }
});

void test('local invalid sessions and navigation signals keep their behavior', async () => {
  assert.deepEqual(await createApiErrorServerSide(invalidSessionError), { data: null, error: invalidSessionError });
  let redirectError: unknown;
  try {
    redirect('/auth/refresh');
  } catch (error) {
    redirectError = error;
  }
  await assert.rejects(createApiErrorServerSide(redirectError), (error: unknown) => error === redirectError);
});

void test('HTTP errors stay intact internally; client errors omit upstream credentials and messages', async () => {
  const secret = 'synthetic-secret';
  for (const fetcher of [
    async () => {
      throw new Error(`failed request Bearer ${secret}`);
    },
    async () => Response.json({ status: { code: '9999', message: secret }, token: secret }, { status: 503 }),
    async () => new Response(secret, { status: 502 }),
  ]) {
    const api = ky.create({ prefixUrl: 'https://api.example', retry: 0, redirect: 'error', fetch: fetcher });
    const result = await api
      .get('items', { headers: { Authorization: `Bearer ${secret}` } })
      .json()
      .catch(createApiErrorServerSide);
    assert.deepEqual(result, { data: null, error: { code: '9999', type: 'toast', message: '系統錯誤' } });
    assert.ok(!JSON.stringify(result).includes(secret));
  }
  const api = ky.create({
    prefixUrl: 'https://api.example',
    retry: 0,
    redirect: 'error',
    fetch: async () => new Response('', { status: 503 }),
  });
  await assert.rejects(api.get('items').json(), HTTPError);
});
