import 'server-only';

import { cookies, headers } from 'next/headers';
import { redirect } from 'next/navigation';
import { ApiFailure, SessionRefreshRequired } from '@/api/errors';
import { createApiSession } from '@/api/session';
import { type ApiClient } from '@/api/transport';
import { transport } from '@/server/transport';

import { readTokens } from './cookies';
import { refreshDestination, returnPathHeader, signInDestination } from './navigation';

/** Rendering must refresh in a separate response that can carry Set-Cookie. */
export async function withRenderApiSession<T>(operation: (api: ApiClient) => Promise<T>): Promise<T> {
  const session = createApiSession({
    transport,
    readTokens: () => readTokens(cookies()),
    refreshTokens: async () => {
      throw new SessionRefreshRequired();
    },
    persistTokens: () => {
      throw new Error('Rendering cannot persist credentials');
    },
  });
  try {
    return await operation(session.api);
  } catch (error) {
    const returnPath = headers().get(returnPathHeader) ?? '/dashboard';
    if (error instanceof SessionRefreshRequired) {
      redirect(refreshDestination(returnPath) ?? signInDestination(returnPath));
    }
    if (error instanceof ApiFailure && error.kind === 'unauthenticated') redirect(signInDestination(returnPath));
    throw error;
  }
}
