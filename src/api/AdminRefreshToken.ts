import { cookies } from 'next/headers';
import { CookieConfigs } from '@/domain/auth/CookieConfigs';
import { appendEntries } from '@/domain/crud/appendEntries';

import { apiClientBase } from './core/apiClientBase';
import { createApiErrorServerSide } from './core/ApiError/createApiErrorServerSide';
import { type SuccessResponseJson } from './core/static';

interface Data {
  token: string;
}

export async function AdminRefreshToken() {
  const token = cookies().get(CookieConfigs.token.name)?.value;
  if (!token) {
    console.error('token is not found');
    return {
      data: null,
      error: {
        code: 'f-1001',
        type: 'redirect',
        url: '/auth/sign-in',
      },
    } as const;
  }

  const refreshToken = cookies().get(CookieConfigs.refreshToken.name)?.value;
  if (!refreshToken) {
    console.error('refreshToken is not found');
    return {
      data: null,
      error: {
        code: 'f-1002',
        type: 'redirect',
        url: '/auth/sign-in',
      },
    } as const;
  }

  const urlencoded = new URLSearchParams();
  appendEntries(urlencoded, { refreshToken });

  const res = await apiClientBase
    .post<SuccessResponseJson<Data>>('backend/session/refresh', {
      body: urlencoded,
      headers: {
        Authorization: `Bearer ${token}`,
      },
    })
    .json()
    .catch(createApiErrorServerSide);

  return res;
}
