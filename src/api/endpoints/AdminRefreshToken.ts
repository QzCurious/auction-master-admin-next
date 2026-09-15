import { HTTPError } from 'ky';

import { type FailedResponseJson, type SuccessResponseJson } from '../core/static';
import { invalidSessionError } from '../errors';
import { type Tokens } from '../session';
import { type ApiTransport } from '../transport';

export async function AdminRefreshToken(transport: ApiTransport, tokens: Tokens): Promise<Tokens> {
  const response = await transport
    .request<SuccessResponseJson<{ token: string }>>('backend/session/refresh', {
      method: 'POST',
      headers: { Authorization: `Bearer ${tokens.accessToken}` },
      body: new URLSearchParams({ refreshToken: tokens.refreshToken }),
    })
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
