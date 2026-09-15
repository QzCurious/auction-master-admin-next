'use server';

import { revalidateTag } from 'next/cache';
import * as endpoint from '@/api/backend/items/AdminUpsertItemPhoto';
import { createActionApi } from '@/server/next/createActionApi';
import { createApiErrorServerSide } from '@/server/next/createApiErrorServerSide';

export async function AdminUpsertItemPhoto(
  id: Parameters<typeof endpoint.AdminUpsertItemPhoto>[1],
  formData: Parameters<typeof endpoint.AdminUpsertItemPhoto>[2]
) {
  const res = await endpoint.AdminUpsertItemPhoto(createActionApi(), id, formData).catch(createApiErrorServerSide);
  revalidateTag('items');
  revalidateTag('auction-items');
  return res;
}
