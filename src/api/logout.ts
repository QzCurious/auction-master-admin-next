'use server';

import { cookieConfigs } from '@/static';
import { revalidatePath } from 'next/cache';
import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';

export async function logout() {
  cookies().delete(cookieConfigs.token.name);
  cookies().delete(cookieConfigs.refreshToken.name);
  revalidatePath('/', 'layout');
  redirect('/auth/sign-in');
}
