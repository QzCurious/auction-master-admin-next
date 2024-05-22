'use server';

import { cookies } from 'next/headers';
import { type JwtPayload } from '@/api/JwtPayload';
import { session } from '@/api/session';
import { jwtDecode } from 'jwt-decode';

export async function login(formData: FormData) {
  const res = await session(formData);

  // should be caught on client side
  if (res.parseError) {
    throw new Error('Parse Error', { cause: res.parseError });
  }

  if (res.error) {
    return res;
  }

  cookies().set('token', res.data.token, {
    expires: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000), // 14 days
    httpOnly: true,
    sameSite: 'strict',
    secure: process.env.NODE_ENV === 'production',
  });
  cookies().set('refreshToken', res.data.refreshToken, {
    expires: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000), // 14 days
    httpOnly: true,
    sameSite: 'strict',
    secure: process.env.NODE_ENV === 'production',
  });

  return res;
}
