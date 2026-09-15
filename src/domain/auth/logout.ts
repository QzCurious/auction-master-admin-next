'use server';

import { revalidatePath } from 'next/cache';
import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import { clearTokens } from '@/server/next/cookies';

export async function logout() {
  clearTokens(cookies());
  revalidatePath('/', 'layout');
  redirect('/auth/sign-in');
}
