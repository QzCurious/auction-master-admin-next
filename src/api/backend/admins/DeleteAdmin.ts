'use server';

import { revalidateTag } from 'next/cache';
import { createApiErrorServerSide } from '@/api/core/ApiError/createApiErrorServerSide';
import * as endpoint from '@/api/endpoints/admins/DeleteAdmin';
import { createActionApi } from '@/server/next/createActionApi';

export async function DeleteAdmin(id: Parameters<typeof endpoint.DeleteAdmin>[1]) {
  const res = await endpoint.DeleteAdmin(createActionApi(), id).catch(createApiErrorServerSide);
  revalidateTag('admins');
  return res;
}
