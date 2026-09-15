'use server';

import { revalidatePath } from 'next/cache';
import { cookies } from 'next/headers';
import * as endpoint from '@/api/AdminLogin';
import { api } from '@/server/api';
import { writeTokens } from '@/server/next/cookies';
import { createApiErrorServerSide } from '@/server/next/createApiErrorServerSide';

export async function AdminLogin(payload: Parameters<typeof endpoint.AdminLogin>[1]) {
  const res = await endpoint.AdminLogin(api, payload).catch(createApiErrorServerSide);
  if (!res.data) return res;
  writeTokens(cookies(), { accessToken: res.data.token, refreshToken: res.data.refreshToken });
  revalidatePath('/', 'layout');
  return null;
}
