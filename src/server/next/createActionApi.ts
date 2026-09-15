import 'server-only';

import { cookies } from 'next/headers';
import { createAuthHooks } from '@/domain/auth/createAuthHooks';
import { invalidSessionError } from '@/domain/auth/errors';
import { refreshTokens } from '@/domain/auth/refreshTokens';
import { createApiSession } from '@/domain/auth/session';
import { api } from '@/server/api';

import { clearTokens, readTokens, writeTokens } from './cookies';

/** Also used by the explicit refresh action and Route Handler. */
export function createActionSession() {
  const store = cookies();
  return createApiSession({
    readTokens: () => {
      try {
        return readTokens(store);
      } catch (error) {
        if (error === invalidSessionError) clearTokens(store);
        throw error;
      }
    },
    refreshTokens: async (tokens) => {
      try {
        return await refreshTokens(api, tokens);
      } catch (error) {
        if (error === invalidSessionError) clearTokens(store);
        throw error;
      }
    },
    persistTokens: (tokens) => {
      writeTokens(store, tokens);
    },
  });
}

/** Create inside a Server Action or Route Handler, where cookies are writable. */
export function createActionApi() {
  const session = createActionSession();
  const auth = createAuthHooks(session, () => clearTokens(cookies()));
  return api.extend({
    retry: { limit: 1, methods: ['get'], statusCodes: [401], delay: () => 0 },
    hooks: {
      beforeRequest: [auth.beforeRequest],
      beforeRetry: [auth.beforeRetry],
    },
  });
}
