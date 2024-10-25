'use server';

import { cookies } from 'next/headers';
import { type JwtPayload } from '@/api/JwtPayload';
import { jwtDecode } from 'jwt-decode';

import { CookieConfigs } from './CookieConfigs';

export async function getJwt() {
  const token = cookies().get(CookieConfigs.token.name)?.value;
  if (!token) return null;

  try {
    const jwt = jwtDecode<JwtPayload>(token);
    return jwt;
  } catch (error) {
    return null;
  }
}
