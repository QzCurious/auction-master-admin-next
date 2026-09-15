'use server';

import { revalidateTag } from 'next/cache';
import { createApiErrorServerSide } from '@/api/core/ApiError/createApiErrorServerSide';
import * as endpoint from '@/api/endpoints/items/AdminUpsertItemPhoto';
import { createActionApi } from '@/server/next/createActionApi';

export async function AdminUpsertItemPhoto(
  id: Parameters<typeof endpoint.AdminUpsertItemPhoto>[1],
  formData: Parameters<typeof endpoint.AdminUpsertItemPhoto>[2]
) {
  const res = await endpoint.AdminUpsertItemPhoto(createActionApi(), id, formData).catch(createApiErrorServerSide);
  revalidateTag('items');
  return res;
}
