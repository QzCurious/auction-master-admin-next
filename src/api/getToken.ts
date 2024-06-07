'use server'

import { cookies } from 'next/headers';
import { jwtDecode } from 'jwt-decode';

import { type JwtPayload } from './JwtPayload';
import { sessionRefresh } from './session-refresh';

let sessionRefreshing: ReturnType<typeof sessionRefresh> | null = null;

export async function getToken({ force }: { force?: boolean } = { force: false }) {
  // no token
  const token = cookies().get('token');
  if (!token?.value) {
    return { token: null, res: null } as const;
  }

  const jwt = jwtDecode<JwtPayload>(token.value);

  // jwt still valid
  if (!force && jwt.exp * 1000 > Date.now() - 30 * 1000) {
    return { token: token.value, res: null } as const;
  }

  const refreshToken = cookies().get('refreshToken');
  if (!refreshToken?.value) {
    throw new Error('BUG: Token expired without refresh token');
  }

  if (!sessionRefreshing) {
    sessionRefreshing = sessionRefresh({ token: token.value, refreshToken: refreshToken.value });
  }

  const res = await sessionRefreshing;
  sessionRefreshing = null;

  // 1003 refresh token expired
  if (!res.data) {
    if (process.env.DEV) {
      console.log('Refresh token expired', res);
    }
    return { token: null, res } as const;
  }

  if (process.env.DEV) {
    console.log('Token renewed');
  }
  return { token: res.data.token, res } as const;
}
