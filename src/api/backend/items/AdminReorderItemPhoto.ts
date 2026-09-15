'use server';

import { revalidateTag } from 'next/cache';
import { createApiErrorServerSide } from '@/api/core/ApiError/createApiErrorServerSide';
import * as endpoint from '@/api/endpoints/items/AdminReorderItemPhoto';
import { createActionApi } from '@/server/next/createActionApi';

export async function AdminReorderItemPhoto(
  id: Parameters<typeof endpoint.AdminReorderItemPhoto>[1],
  payload: Parameters<typeof endpoint.AdminReorderItemPhoto>[2]
) {
  const res = await endpoint.AdminReorderItemPhoto(createActionApi(), id, payload).catch(createApiErrorServerSide);
  revalidateTag('items');
  return res;
}
