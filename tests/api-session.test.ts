import assert from 'node:assert/strict';
import { test } from 'node:test';

import ky, { HTTPError, type KyInstance } from 'ky';

import { createAuthHooks } from '../src/api/createAuthHooks';
import { AdminRefreshToken } from '../src/api/endpoints/AdminRefreshToken';
import { AdminUpdateItem } from '../src/api/endpoints/AdminUpdateItem';
import { GetItemsAndDetails } from '../src/api/endpoints/GetItemsAndDetails';
import { invalidSessionError } from '../src/api/errors';
import { createApiSession, ensureFreshToken, refreshRejectedToken, type Tokens } from '../src/api/session';

const now = 1_700_000_000_000;
function token(exp = now / 1000 + 3600, user = 'a') {
  return `e30.${Buffer.from(JSON.stringify({ exp, sub: user })).toString('base64url')}.signature`;
}
const old: Tokens = { accessToken: token(), refreshToken: 'refresh-secret' };
const updated: Tokens = { ...old, accessToken: token(now / 1000 + 7200) };
const success = (data: unknown = 'Success') => Response.json({ data, status: { code: '0' } });
const expired = () => Response.json({ data: null, status: { code: '1003' } }, { status: 401 });
function transport(fetcher: (request: Request, init?: RequestInit) => Response | Promise<Response>) {
  return ky.create({
    prefixUrl: 'https://api.example/',
    retry: 0,
    redirect: 'error',
    fetch: async (input, init) => fetcher(input as Request, init),
  });
}
function session(overrides: Partial<Parameters<typeof createApiSession>[0]> & { transport?: KyInstance } = {}) {
  const state = createApiSession({
    readTokens: () => old,
    refreshTokens: async () => updated,
    persistTokens: () => undefined,
    now: () => now,
    ...overrides,
  });
  const auth = createAuthHooks(state);
  const api = (overrides.transport ?? transport(() => success())).extend({
    retry: { limit: 1, methods: ['get'], statusCodes: [401], delay: () => 0 },
    hooks: { beforeRequest: [auth.beforeRequest], beforeRetry: [auth.beforeRetry] },
  });
  return { ...state, api };
}

void test('lazy token reader runs once and sessions isolate users on a shared transport', async () => {
  const seen: string[] = [];
  const shared = transport((request) => {
    seen.push(request.headers.get('Authorization')!);
    return success();
  });
  let reads = 0;
  const a = session({
    transport: shared,
    readTokens: async () => {
      reads++;
      return old;
    },
  });
  const b = session({ transport: shared, readTokens: () => ({ ...old, accessToken: token(undefined, 'b') }) });
  assert.equal(reads, 0);
  await Promise.all([a.api('one').json(), b.api('two').json(), a.api('three').json()]);
  assert.equal(reads, 1);
  assert.equal(seen.filter((value) => value === `Bearer ${old.accessToken}`).length, 2);
  assert.ok(seen.includes(`Bearer ${token(undefined, 'b')}`));
});

void test('near expiry refreshes before mutation and persists once, retaining refresh token', async () => {
  let writes = 0;
  let refreshes = 0;
  const expiredTokens = { ...old, accessToken: token(now / 1000 + 20) };
  const auth = session({
    readTokens: () => expiredTokens,
    refreshTokens: async () => {
      refreshes++;
      return updated;
    },
    persistTokens: (tokens) => {
      writes++;
      assert.deepEqual(tokens, updated);
    },
    transport: transport((request) => {
      assert.equal(request.headers.get('Authorization'), `Bearer ${updated.accessToken}`);
      return success();
    }),
  });
  await auth.api('write', { method: 'PATCH', body: new URLSearchParams({ name: 'item' }) }).json();
  await auth.persistTokens();
  await auth.persistTokens();
  assert.equal(refreshes, 1);
  assert.equal(writes, 1);
});

void test('parallel rejection shares refresh and late rejection reuses the new token', async () => {
  let refreshes = 0;
  let requests = 0;
  const auth = session({
    refreshTokens: async () => {
      refreshes++;
      await new Promise((resolve) => {
        setTimeout(resolve, 5);
      });
      return updated;
    },
    transport: transport((request) => {
      requests++;
      return request.headers.get('Authorization') === `Bearer ${old.accessToken}` ? expired() : success();
    }),
  });
  await Promise.all([auth.api('one').json(), auth.api('two').json()]);
  assert.equal(refreshes, 1);
  assert.equal(requests, 4);
  assert.equal(await refreshRejectedToken(auth, old.accessToken), updated.accessToken);
  assert.equal(refreshes, 1);
});

void test('separate sessions do not claim cross-request deduplication', async () => {
  let refreshes = 0;
  const refresh = async () => {
    refreshes++;
    return updated;
  };
  await Promise.all([session({ refreshTokens: refresh }).refresh(), session({ refreshTokens: refresh }).refresh()]);
  assert.equal(refreshes, 2);
});

void test('read retry is bounded; writes and non-expiry failures are never replayed', async () => {
  for (const method of ['GET', 'PATCH', 'POST', 'DELETE']) {
    let calls = 0;
    let refreshes = 0;
    const auth = session({
      transport: transport(() => {
        calls++;
        return expired();
      }),
      refreshTokens: async () => {
        refreshes++;
        return updated;
      },
    });
    await assert.rejects(
      auth.api('item', { method }).json(),
      (e: unknown) => e instanceof HTTPError && e.response.status === 401
    );
    assert.equal(calls, method === 'GET' ? 2 : 1);
    assert.equal(refreshes, method === 'GET' ? 1 : 0);
  }
  for (const [status, code] of [
    [403, '1001', 'forbidden'],
    [503, '1003', 'service'],
    [400, '11', 'validation'],
    [401, '1002', 'unauthenticated'],
  ] as const) {
    let refreshes = 0;
    const auth = session({
      transport: transport(() => Response.json({ status: { code } }, { status })),
      refreshTokens: async () => {
        refreshes++;
        return updated;
      },
    });
    await assert.rejects(
      auth.api('item').json(),
      (e: unknown) => e instanceof HTTPError && e.response.status === status
    );
    assert.equal(refreshes, 0);
  }
});

void test('failed refresh is shared and never persisted; persistence failure remains retryable', async () => {
  let refreshes = 0;
  let writes = 0;
  const auth = session({
    refreshTokens: async () => {
      refreshes++;
      throw new Error('Service unavailable');
    },
    persistTokens: () => {
      writes++;
    },
  });
  await Promise.all([assert.rejects(auth.refresh()), assert.rejects(auth.refresh())]);
  await assert.rejects(auth.refresh());
  await auth.persistTokens();
  assert.equal(refreshes, 1);
  assert.equal(writes, 0);
  const retry = session({
    persistTokens: () => {
      writes++;
      if (writes === 1) throw new Error('write failed');
    },
  });
  await retry.refresh();
  await assert.rejects(retry.persistTokens());
  await retry.persistTokens();
  assert.equal(writes, 2);
});

void test('successful refresh remains persistable after downstream failure', async () => {
  let saved: Tokens | undefined;
  const auth = session({
    transport: transport((request) =>
      request.headers.get('Authorization') === `Bearer ${old.accessToken}`
        ? expired()
        : new Response('unavailable', { status: 503 })
    ),
    persistTokens: (tokens) => {
      saved = tokens;
    },
  });
  await assert.rejects(auth.api('items').json(), (e: unknown) => e instanceof HTTPError && e.response.status === 503);
  await auth.persistTokens();
  assert.deepEqual(saved, updated);
});

void test('missing/malformed credentials fail before sending; render adapter can signal refresh', async () => {
  for (const value of ['', 'malformed', 'e30.e30.signature']) {
    const auth = session({ readTokens: () => ({ ...old, accessToken: value }) });
    await assert.rejects(ensureFreshToken(auth), (e: unknown) => e === invalidSessionError);
  }
  const renderRedirect = new Error('Render redirect');
  const auth = session({
    readTokens: () => ({ ...old, accessToken: token(1) }),
    refreshTokens: async () => {
      throw renderRedirect;
    },
  });
  await assert.rejects(auth.api('items').json(), (error: unknown) => error === renderRedirect);
});

void test('refresh endpoint preserves exact form/header contract and maps definitive rejection', async () => {
  const api = transport(async (request) => {
    assert.equal(request.url, 'https://api.example/backend/session/refresh');
    assert.equal(request.method, 'POST');
    assert.equal(request.headers.get('Authorization'), `Bearer ${old.accessToken}`);
    assert.equal(await request.text(), 'refreshToken=refresh-secret');
    return success({ token: updated.accessToken });
  });
  assert.deepEqual(await AdminRefreshToken(api, old), updated);
  await assert.rejects(
    AdminRefreshToken(
      transport(() => expired()),
      old
    ),
    (e: unknown) => e === invalidSessionError
  );
});

void test('refresh rejection follows backend codes rather than HTTP status', async () => {
  for (const [status, code] of [
    [401, '1002'],
    [403, '1001'],
    [503, '9999'],
    [503, '1003'],
  ] as const) {
    await assert.rejects(
      AdminRefreshToken(
        transport(() => Response.json({ status: { code } }, { status })),
        old
      ),
      (error: unknown) =>
        code === '1003' ? error === invalidSessionError : error instanceof HTTPError && error.response.status === status
    );
  }
});

void test('pilot query preserves repeated filters/defaults and adapter cache tags', async () => {
  const api = session({
    transport: transport((request, init) => {
      assert.equal(request.url, 'https://api.example/backend/items?consignorId=4&status=1&status=2&limit=10&offset=0');
      assert.equal(request.headers.get('Authorization'), `Bearer ${old.accessToken}`);
      assert.deepEqual((init as RequestInit & { next: unknown }).next, { tags: ['items'] });
      return success({ items: [], count: 0, statusCounts: {} });
    }),
  }).api;
  await GetItemsAndDetails(api.extend({ next: { tags: ['items'] } }), { consignorId: 4, status: [1, 2] });
});

void test('pilot mutation preserves false, zero, date and null omission; validates before HTTP', async () => {
  let calls = 0;
  const api = session({
    transport: transport(async (request) => {
      calls++;
      assert.equal(request.method, 'PATCH');
      assert.equal(request.url, 'https://api.example/backend/items/12');
      const body = new URLSearchParams(await request.text());
      assert.equal(body.get('isNew'), 'false');
      assert.equal(body.get('space'), '0');
      assert.equal(body.get('expireAt'), '2030-01-02T00:00:00.000Z');
      assert.equal(body.has('description'), false);
      assert.equal(body.get('name'), 'item & name');
      return success();
    }),
  }).api;
  await AdminUpdateItem(api, 12, {
    name: 'item & name',
    isNew: false,
    space: 0,
    description: null,
    expireAt: new Date('2030-01-02'),
  });
  await assert.rejects(AdminUpdateItem(api, 12, { reservePrice: 0 }));
  assert.equal(calls, 1);
});

void test('auth hooks compose with additional native Ky hooks and preserve their order', async () => {
  const events: string[] = [];
  const state = createApiSession({
    readTokens: () => old,
    refreshTokens: async () => {
      events.push('refresh');
      return updated;
    },
    persistTokens: () => {
      events.push('persist');
    },
    now: () => now,
  });
  const auth = createAuthHooks(state);
  const api = transport((request) => {
    events.push('fetch');
    assert.equal(request.headers.get('X-Extra'), 'present');
    return request.headers.get('Authorization') === `Bearer ${old.accessToken}` ? expired() : success();
  }).extend({
    retry: { limit: 1, methods: ['get'], statusCodes: [401], delay: () => 0 },
    hooks: {
      beforeRequest: [
        auth.beforeRequest,
        (request) => {
          events.push('extra-before-request');
          request.headers.set('X-Extra', 'present');
        },
      ],
      beforeRetry: [
        auth.beforeRetry,
        () => {
          events.push('extra-before-retry');
        },
      ],
    },
  });
  await api.get('items').json();
  assert.deepEqual(events, [
    'extra-before-request',
    'fetch',
    'refresh',
    'persist',
    'extra-before-retry',
    'extra-before-request',
    'fetch',
  ]);
});

void test('network failures do not gain retries when auth hooks are registered', async () => {
  let calls = 0;
  let refreshes = 0;
  const failure = new Error('Connection failed');
  const auth = session({
    transport: transport(() => {
      calls++;
      throw failure;
    }),
    refreshTokens: async () => {
      refreshes++;
      return updated;
    },
  });
  await assert.rejects(auth.api.get('items').json(), (error: unknown) => error === failure);
  assert.equal(calls, 1);
  assert.equal(refreshes, 0);
});
