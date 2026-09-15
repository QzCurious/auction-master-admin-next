'use server';

import { revalidateTag } from 'next/cache';
import { createApiErrorServerSide } from '@/api/core/ApiError/createApiErrorServerSide';
import * as endpoint from '@/api/endpoints/consignor/AdminUpdateConsignor';
import { createActionApi } from '@/server/next/createActionApi';

export async function AdminUpdateConsignor(
  id: Parameters<typeof endpoint.AdminUpdateConsignor>[1],
  payload: Parameters<typeof endpoint.AdminUpdateConsignor>[2]
) {
  const res = await endpoint.AdminUpdateConsignor(createActionApi(), id, payload).catch(createApiErrorServerSide);
  revalidateTag('consignors');
  return res;
}
