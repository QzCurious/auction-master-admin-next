'use server';

import { revalidateTag } from 'next/cache';
import * as endpoint from '@/api/backend/items/AdminReorderItemPhoto';
import { createActionApi } from '@/server/next/createActionApi';
import { createApiErrorServerSide } from '@/server/next/createApiErrorServerSide';

export async function AdminReorderItemPhoto(
  id: Parameters<typeof endpoint.AdminReorderItemPhoto>[1],
  payload: Parameters<typeof endpoint.AdminReorderItemPhoto>[2]
) {
  const res = await endpoint.AdminReorderItemPhoto(createActionApi(), id, payload).catch(createApiErrorServerSide);
  revalidateTag('items');
  revalidateTag('auction-items');
  return res;
}
