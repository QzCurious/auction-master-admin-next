'use server';

import { revalidateTag } from 'next/cache';
import * as endpoint from '@/api/backend/items/ItemArrival';
import { createActionApi } from '@/server/next/createActionApi';
import { createApiErrorServerSide } from '@/server/next/createApiErrorServerSide';

export async function ItemArrival(id: Parameters<typeof endpoint.ItemArrival>[1]) {
  const res = await endpoint.ItemArrival(createActionApi(), id).catch(createApiErrorServerSide);
  revalidateTag('items');
  return res;
}
