'use server';

import { revalidateTag } from 'next/cache';
import { createApiErrorServerSide } from '@/api/core/ApiError/createApiErrorServerSide';
import * as endpoint from '@/api/endpoints/admins/CreateAdmin';
import { createActionApi } from '@/server/next/createActionApi';

export async function CreateAdmin(payload: Parameters<typeof endpoint.CreateAdmin>[1]) {
  const res = await endpoint.CreateAdmin(createActionApi(), payload).catch(createApiErrorServerSide);
  revalidateTag('admins');
  return res;
}
