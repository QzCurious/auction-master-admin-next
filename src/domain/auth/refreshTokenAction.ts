'use server';

import { revalidatePath } from 'next/cache';
import { cookies } from 'next/headers';
import { AdminRefreshToken } from '@/api/AdminRefreshToken';

import { CookieConfigs } from './CookieConfigs';

export default async function refreshTokenAction() {
  const res = await AdminRefreshToken();

  if (res.error) {
    return res;
  }

  cookies().set(CookieConfigs.token.name, res.data.token, CookieConfigs.token.opts());
  revalidatePath('/', 'layout');

  return res;
}
