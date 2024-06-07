'use server';

import { revalidatePath } from 'next/cache';
import { cookies } from 'next/headers';

import { getToken } from './getToken';

export default async function refreshTokenAction() {
  const { token, res } = await getToken({ force: true });

  if (token) {
    cookies().set('token', token, {
      expires: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000), // 14 days
      httpOnly: true,
      sameSite: 'strict',
      // secure: process.env.NODE_ENV === 'production',
    });
    revalidatePath('/', 'layout');
    return
  }

  return `Failed to refresh token: ${res?.error}`;
}
