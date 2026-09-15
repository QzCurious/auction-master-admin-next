import assert from 'node:assert/strict';
import { test } from 'node:test';

import { redirect } from 'next/navigation';

import { createApiErrorServerSide } from '../src/api/core/ApiError/createApiErrorServerSide';
import { ApiFailure, SessionRefreshRequired } from '../src/api/errors';
import { createApiTransport } from '../src/api/transport';

void test('compatibility adapter maps meanings without turning service failure into logout', async () => {
  const unavailable = await createApiErrorServerSide(new ApiFailure('service', '1003', 503));
  assert.equal(unavailable.error.type, 'toast');
  const forbidden = await createApiErrorServerSide(new ApiFailure('forbidden', '9999', 403));
  assert.equal(forbidden.error.code, '1001');
  const expired = await createApiErrorServerSide(new ApiFailure('expired', '1003', 401));
  assert.equal(expired.error.type, 'redirect');
  await assert.rejects(createApiErrorServerSide(new SessionRefreshRequired()), SessionRefreshRequired);
  let redirectError: unknown;
  try {
    redirect('/auth/refresh');
  } catch (error) {
    redirectError = error;
  }
  await assert.rejects(createApiErrorServerSide(redirectError), (error: unknown) => error === redirectError);
});

void test('transport failures do not retain credentials or untrusted response messages', async () => {
  const secret = 'synthetic-secret';
  for (const fetcher of [
    async () => {
      throw new Error(`failed request Bearer ${secret}`);
    },
    async () => Response.json({ status: { code: '9999', message: secret }, token: secret }, { status: 503 }),
    async () => new Response(secret, { status: 502 }),
    async () => Response.json({ status: { code: secret } }, { status: 503 }),
  ]) {
    const api = createApiTransport({ baseUrl: 'https://api.example', fetch: fetcher });
    await assert.rejects(api.request('items', { headers: { Authorization: `Bearer ${secret}` } }), (error: unknown) => {
      assert.ok(error instanceof ApiFailure);
      assert.ok(!JSON.stringify(error).includes(secret));
      assert.ok(!error.message.includes(secret));
      assert.equal(error.cause, undefined);
      return true;
    });
  }
});
