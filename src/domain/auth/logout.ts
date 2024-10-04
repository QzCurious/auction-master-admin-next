'use server';

import { revalidatePath } from 'next/cache';
import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';

import { CookieConfigs } from './CookieConfigs';

export async function logout() {
  cookies().delete(CookieConfigs.token.name);
  cookies().delete(CookieConfigs.refreshToken.name);
  revalidatePath('/', 'layout');
  redirect('/auth/sign-in');
}
