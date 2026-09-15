import { AdminRefreshToken } from '@/api/AdminRefreshToken';
import { type FailedResponseJson } from '@/api/core/static';
import { HTTPError, type KyInstance } from 'ky';

import { invalidSessionError } from './errors';
import { type Tokens } from './session';

/** Interpret refresh failure and retain the refresh token outside the raw HTTP operation. */
export async function refreshTokens(transport: KyInstance, tokens: Tokens): Promise<Tokens> {
  const response = await AdminRefreshToken(transport, tokens).catch(async (error: unknown) => {
    if (error instanceof HTTPError) {
      const body = (await error.response
        .clone()
        .json()
        .catch(() => null)) as FailedResponseJson | null;
      if (body?.status?.code === '1003') throw invalidSessionError;
    }
    throw error;
  });
  if (!response.data || typeof response.data.token !== 'string' || !response.data.token)
    throw new Error('Invalid refresh response');
  return { accessToken: response.data.token, refreshToken: tokens.refreshToken };
}
