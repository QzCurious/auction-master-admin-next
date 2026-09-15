'use server';

import { revalidateTag } from 'next/cache';
import { createApiErrorServerSide } from '@/api/core/ApiError/createApiErrorServerSide';
import * as endpoint from '@/api/endpoints/admins/UpdateAdmin';
import { createActionApi } from '@/server/next/createActionApi';

export async function UpdateAdmin(
  id: Parameters<typeof endpoint.UpdateAdmin>[1],
  payload: Parameters<typeof endpoint.UpdateAdmin>[2]
) {
  const res = await endpoint.UpdateAdmin(createActionApi(), id, payload).catch(createApiErrorServerSide);
  revalidateTag('admins');
  return res;
}
