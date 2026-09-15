import assert from 'node:assert/strict';
import { test } from 'node:test';

import { NextRequest } from 'next/server';
import ky, { type KyInstance } from 'ky';

import { refreshMiddleware } from '../src/server/next/refreshMiddleware';

function token(exp: number) {
  return `e30.${Buffer.from(JSON.stringify({ exp })).toString('base64url')}.signature`;
}
const fresh = token(Date.now() / 1000 + 3600);
function request(accessToken = token(1)) {
  return new NextRequest('https://app.example/dashboard/items?status=1&status=2', {
    headers: {
      cookie: `admin-token=${accessToken}; admin-refresh-token=secret; unrelated=kept`,
      'x-api-return-path': '//evil.example',
    },
  });
}

void test('middleware forwards updated cookies and emits HttpOnly response cookies', async () => {
  const transport = ky.create({
    prefixUrl: 'https://api.example',
    retry: 0,
    redirect: 'error',
    fetch: async () => Response.json({ data: { token: fresh } }),
  });
  const response = await refreshMiddleware(request(), transport);
  assert.equal(response.status, 200);
  assert.equal(response.cookies.get('admin-token')?.value, fresh);
  assert.ok(response.headers.get('set-cookie')?.includes('HttpOnly'));
  const forwarded = response.headers.get('x-middleware-request-cookie');
  assert.ok(forwarded?.includes(`admin-token=${fresh}`));
  assert.ok(forwarded?.includes('unrelated=kept'));
  assert.equal(response.headers.get('x-middleware-request-x-api-return-path'), '/dashboard/items?status=1&status=2');
});

void test('fresh middleware request does not refresh or write cookies', async () => {
  let calls = 0;
  const transport = ky.create({
    prefixUrl: 'https://api.example',
    retry: 0,
    redirect: 'error',
    fetch: async () => {
      calls++;
      return Response.json({});
    },
  });
  const response = await refreshMiddleware(request(fresh), transport);
  assert.equal(calls, 0);
  assert.equal(response.headers.get('set-cookie'), null);
});

void test('definitive refresh rejection clears cookies; transient failure retains session', async () => {
  for (const [status, code] of [
    [401, '1003'],
    [503, '1003'],
    [403, '1001'],
    [503, '9999'],
  ] as const) {
    const transport = ky.create({
      prefixUrl: 'https://api.example',
      retry: 0,
      redirect: 'error',
      fetch: async () => Response.json({ status: { code } }, { status }),
    });
    const response = await refreshMiddleware(request(), transport);
    if (code === '1003') {
      assert.equal(response.status, 307);
      assert.equal(
        new URL(response.headers.get('location')!).searchParams.get('goto'),
        '/dashboard/items?status=1&status=2'
      );
      assert.equal(response.cookies.get('admin-token')?.maxAge, 0);
    } else {
      assert.equal(response.status, 503);
      assert.equal(response.headers.get('set-cookie'), null);
    }
  }
});
