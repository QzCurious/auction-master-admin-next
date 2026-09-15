import { type SuccessResponseJson } from '../core/static';
import { ApiFailure } from '../errors';
import { type Tokens } from '../session';
import { type ApiTransport } from '../transport';

export async function refreshTokens(transport: ApiTransport, tokens: Tokens): Promise<Tokens> {
  const response = await transport
    .request<SuccessResponseJson<{ token: string }>>('backend/session/refresh', {
      method: 'POST',
      headers: { Authorization: `Bearer ${tokens.accessToken}` },
      body: new URLSearchParams({ refreshToken: tokens.refreshToken }),
    })
    .catch((error: unknown) => {
      if (error instanceof ApiFailure && ['expired', 'unauthenticated', 'forbidden'].includes(error.kind)) {
        throw new ApiFailure('unauthenticated', '1003', error.status);
      }
      throw error;
    });
  if (!response.data || typeof response.data.token !== 'string' || !response.data.token)
    throw new ApiFailure('service');
  return { accessToken: response.data.token, refreshToken: tokens.refreshToken };
}
