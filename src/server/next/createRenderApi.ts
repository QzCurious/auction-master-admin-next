import 'server-only';

import { cookies, headers } from 'next/headers';
import { redirect } from 'next/navigation';
import { createAuthHooks } from '@/api/createAuthHooks';
import { createApiSession } from '@/api/session';
import { refreshDestination, returnPathHeader, signInDestination } from '@/domain/auth/navigation';
import { api } from '@/server/api';

import { readTokens } from './cookies';

export function createRenderApi() {
  const store = cookies();
  const returnPath = headers().get(returnPathHeader) ?? '/dashboard';
  const session = createApiSession({
    readTokens: () => readTokens(store),
    refreshTokens: async () => {
      redirect(refreshDestination(returnPath) ?? signInDestination(returnPath));
    },
    persistTokens: () => {
      throw new Error('Rendering cannot persist credentials');
    },
  });
  const auth = createAuthHooks(session, () => redirect(signInDestination(returnPath)));
  return api.extend({
    retry: { limit: 1, methods: ['get'], statusCodes: [401], delay: () => 0 },
    hooks: {
      beforeRequest: [auth.beforeRequest],
      beforeRetry: [auth.beforeRetry],
    },
  });
}
