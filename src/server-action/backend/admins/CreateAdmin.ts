'use server';

import { revalidateTag } from 'next/cache';
import * as endpoint from '@/api/backend/admins/CreateAdmin';
import { createActionApi } from '@/server/next/createActionApi';
import { createApiErrorServerSide } from '@/server/next/createApiErrorServerSide';

export async function CreateAdmin(payload: Parameters<typeof endpoint.CreateAdmin>[1]) {
  const res = await endpoint.CreateAdmin(createActionApi(), payload).catch(createApiErrorServerSide);
  revalidateTag('admins');
  return res;
}
