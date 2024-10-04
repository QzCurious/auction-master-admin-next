'use server';

import { revalidatePath } from 'next/cache';
import { cookies } from 'next/headers';

import { CookieConfigs } from './CookieConfigs';
import { getToken } from './getToken';

export default async function refreshTokenAction() {
  const { token, res } = await getToken({ force: true });

  if (token) {
    cookies().set(CookieConfigs.token.name, token, CookieConfigs.token.opts());
    revalidatePath('/', 'layout');
    return;
  }

  return `Failed to refresh token: ${res?.error}`;
}
