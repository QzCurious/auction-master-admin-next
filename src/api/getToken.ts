'use server';

import { cookies } from 'next/headers';
import { cookieConfigs } from '@/static';
import { jwtDecode } from 'jwt-decode';

import { AdminRefreshToken } from './AdminRefreshToken';
import { type JwtPayload } from './JwtPayload';

let sessionRefreshing: ReturnType<typeof AdminRefreshToken> | null = null;

export async function getToken({ force }: { force?: boolean } = { force: false }) {
  // no token
  const token = cookies().get(cookieConfigs.token.name);
  if (!token?.value) {
    return { token: null, res: null } as const;
  }

  const jwt = jwtDecode<JwtPayload>(token.value);

  // jwt still valid
  if (!force && jwt.exp * 1000 - 30 * 1000 > Date.now()) {
    return { token: token.value, res: null } as const;
  }

  const refreshToken = cookies().get(cookieConfigs.refreshToken.name);
  if (!refreshToken?.value) {
    throw new Error('BUG: Token expired without refresh token');
  }

  if (!sessionRefreshing) {
    sessionRefreshing = AdminRefreshToken({ token: token.value, refreshToken: refreshToken.value });
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

export async function getJwt() {
  const { token } = await getToken();
  const jwt = token ? jwtDecode<JwtPayload>(token) : null;
  return jwt;
}

export async function getUser() {
  const jwt = await getJwt();
  if (!jwt) return null;

  const user = {
    id: jwt.id,
    account: jwt.account,
  };
  return user;
}
