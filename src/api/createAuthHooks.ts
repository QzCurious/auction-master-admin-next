import { HTTPError, type BeforeRequestHook, type BeforeRetryHook } from 'ky';

import { type FailedResponseJson } from './core/static';
import { invalidSessionError } from './errors';
import { ensureFreshToken, refreshRejectedToken, type ApiSession } from './session';

/** Share one session per invocation; register these hooks explicitly on a Ky instance. */
export function createAuthHooks(session: ApiSession, onInvalidSession: () => void = () => undefined) {
  const beforeRequest: BeforeRequestHook = async (request) => {
    try {
      const token = await ensureFreshToken(session);
      await session.persistTokens();
      request.headers.set('Authorization', `Bearer ${token}`);
    } catch (error) {
      if (error === invalidSessionError) onInvalidSession();
      throw error;
    }
  };

  const beforeRetry: BeforeRetryHook = async ({ request, error, retryCount }) => {
    // Preserve the existing single retry for expired-token GET responses only.
    if (retryCount > 1 || request.method !== 'GET' || !(error instanceof HTTPError) || error.response.status !== 401) {
      throw error;
    }
    const body = (await error.response
      .clone()
      .json()
      .catch(() => null)) as FailedResponseJson | null;
    if (body?.status?.code !== '1003') throw error;
    const rejectedToken = request.headers.get('Authorization')?.slice('Bearer '.length) ?? '';
    const token = await refreshRejectedToken(session, rejectedToken);
    await session.persistTokens();
    request.headers.set('Authorization', `Bearer ${token}`);
  };

  return { beforeRequest, beforeRetry };
}
