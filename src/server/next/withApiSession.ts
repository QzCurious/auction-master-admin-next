import 'server-only';

import { cookies } from 'next/headers';
import { refreshTokens } from '@/api/endpoints/refreshTokens';
import { invalidSessionError } from '@/api/errors';
import { createApiSession, type ApiSession } from '@/api/session';
import { type ApiClient } from '@/api/transport';
import { transport } from '@/server/transport';

import { clearTokens, readTokens, writeTokens } from './cookies';

/** Only call from a Server Action or Route Handler, where cookie writes are allowed. */
export async function withApiSession<T>(operation: (api: ApiClient, session: ApiSession) => Promise<T>): Promise<T> {
  const session = createApiSession({
    transport,
    readTokens: () => readTokens(cookies()),
    refreshTokens: (tokens) => refreshTokens(transport, tokens),
    persistTokens: (tokens) => {
      writeTokens(cookies(), tokens);
    },
  });
  let invalid = false;
  try {
    return await operation(session.api, session);
  } catch (error) {
    invalid = error === invalidSessionError;
    throw error;
  } finally {
    if (invalid) clearTokens(cookies());
    else await session.persistTokens();
  }
}
