import assert from 'node:assert/strict';
import { test } from 'node:test';

import {
  afterRefreshDestination,
  refreshDestination,
  safeReturnPath,
  signInDestination,
} from '../src/domain/auth/navigation';
import { clearTokens, readTokens, writeTokens } from '../src/server/next/cookies';

void test('return destination rejects external, ambiguous, and looping paths', () => {
  for (const value of [
    'https://evil.example',
    '//evil.example',
    '/\\evil.example',
    '/%2f%2fevil.example',
    '/%5cevil.example',
    '/auth/refresh',
    '/api/foo',
    '/%61uth/refresh',
    '/foo/../auth/refresh',
    '/\n/evil',
  ]) {
    assert.equal(safeReturnPath(value), '/dashboard', value);
  }
  assert.equal(safeReturnPath('/dashboard/items?sort=name&filter=a%26b'), '/dashboard/items?sort=name&filter=a%26b');
});

void test('refresh is bounded and login return URLs preserve nested query parameters', () => {
  const original = '/dashboard/items?filter=a%26b&sort=name';
  const route = refreshDestination(original)!;
  assert.equal(new URL(route, 'https://local').searchParams.get('goto'), original);
  assert.equal(refreshDestination(afterRefreshDestination(original)), undefined);
  assert.equal(
    new URL(signInDestination(afterRefreshDestination(original)), 'https://local').searchParams.get('goto'),
    original
  );
});

void test('cookie writer keeps credentials HttpOnly, host-scoped, and clears both consistently', () => {
  const values = new Map<string, string>();
  const writes: Array<{ name: string; options: unknown }> = [];
  const store = {
    get: (name: string) => (values.has(name) ? { value: values.get(name)! } : undefined),
    set: (name: string, value: string, options: Record<string, unknown>) => {
      values.set(name, value);
      writes.push({ name, options });
    },
  };
  const tokens = { accessToken: 'access', refreshToken: 'refresh' };
  writeTokens(store, tokens);
  assert.deepEqual(readTokens(store), tokens);
  for (const write of writes) {
    const options = write.options as Record<string, unknown>;
    assert.equal(options.httpOnly, true);
    assert.equal(options.path, '/');
    assert.equal(options.sameSite, 'strict');
    assert.equal(options.domain, undefined);
  }
  clearTokens(store);
  assert.throws(() => readTokens(store));
});
