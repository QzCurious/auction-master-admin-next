import { HTTPError, type KyInstance } from 'ky';

import { type FailedResponseJson, type SuccessResponseJson } from '../core/static';
import { invalidSessionError } from '../errors';
import { type Tokens } from '../session';

export async function AdminRefreshToken(transport: KyInstance, tokens: Tokens): Promise<Tokens> {
  const response = await transport
    .post<SuccessResponseJson<{ token: string }>>('backend/session/refresh', {
      headers: { Authorization: `Bearer ${tokens.accessToken}` },
      body: new URLSearchParams({ refreshToken: tokens.refreshToken }),
    })
    .json()
    .catch(async (error: unknown) => {
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
