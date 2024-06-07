'use server';

import { revalidatePath } from 'next/cache';
import { getToken } from '@/api/getToken';

export async function refreshTokenAction() {
  const token = await getToken({ force: true });
  revalidatePath('/', 'layout');
  return token;
}
