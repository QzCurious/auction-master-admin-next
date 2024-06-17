'use server';

import { cookieConfigs } from '@/static';
import { revalidatePath } from 'next/cache';
import { cookies } from 'next/headers';

import { getToken } from './getToken';

export default async function refreshTokenAction() {
  const { token, res } = await getToken({ force: true });

  if (token) {
    cookies().set(cookieConfigs.token.name, token, cookieConfigs.token.opts);
    revalidatePath('/', 'layout');
    return;
  }

  return `Failed to refresh token: ${res?.error}`;
}
