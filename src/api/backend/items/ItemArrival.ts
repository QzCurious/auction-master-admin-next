'use server';

import { revalidateTag } from 'next/cache';
import { createApiErrorServerSide } from '@/api/core/ApiError/createApiErrorServerSide';
import * as endpoint from '@/api/endpoints/items/ItemArrival';
import { createActionApi } from '@/server/next/createActionApi';

export async function ItemArrival(id: Parameters<typeof endpoint.ItemArrival>[1]) {
  const res = await endpoint.ItemArrival(createActionApi(), id).catch(createApiErrorServerSide);
  revalidateTag('items');
  return res;
}
