import { type SuccessResponseJson } from '@/api/core/static';
import { type KyInstance } from 'ky';

export interface RefreshTokenCredentials {
  accessToken: string;
  refreshToken: string;
}

export function AdminRefreshToken(api: KyInstance, tokens: RefreshTokenCredentials) {
  return api
    .post<SuccessResponseJson<{ token: string }>>('backend/session/refresh', {
      headers: { Authorization: `Bearer ${tokens.accessToken}` },
      body: new URLSearchParams({ refreshToken: tokens.refreshToken }),
    })
    .json();
}
