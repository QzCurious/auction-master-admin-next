'use server';

import { revalidatePath } from 'next/cache';
import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';

export async function logout() {
  cookies().delete('token');
  cookies().delete('refreshToken');
  revalidatePath('/', 'layout');
  redirect('/auth/sign-in');
}
