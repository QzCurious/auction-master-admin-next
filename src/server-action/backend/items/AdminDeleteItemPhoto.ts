'use server';

import { revalidateTag } from 'next/cache';
import * as endpoint from '@/api/backend/items/AdminDeleteItemPhoto';
import { createActionApi } from '@/server/next/createActionApi';
import { createApiErrorServerSide } from '@/server/next/createApiErrorServerSide';

export async function AdminDeleteItemPhoto(
  id: Parameters<typeof endpoint.AdminDeleteItemPhoto>[1],
  sorted: Parameters<typeof endpoint.AdminDeleteItemPhoto>[2]
) {
  const res = await endpoint.AdminDeleteItemPhoto(createActionApi(), id, sorted).catch(createApiErrorServerSide);
  revalidateTag('items');
  return res;
}
