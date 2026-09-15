'use server';

import { revalidateTag } from 'next/cache';
import { createApiErrorServerSide } from '@/api/core/ApiError/createApiErrorServerSide';
import * as endpoint from '@/api/endpoints/items/ItemReturned';
import { createActionApi } from '@/server/next/createActionApi';

export async function ItemReturned(id: Parameters<typeof endpoint.ItemReturned>[1]) {
  const res = await endpoint.ItemReturned(createActionApi(), id).catch(createApiErrorServerSide);
  revalidateTag('items');
  return res;
}
