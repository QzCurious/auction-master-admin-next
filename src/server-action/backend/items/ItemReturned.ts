'use server';

import { revalidateTag } from 'next/cache';
import * as endpoint from '@/api/backend/items/ItemReturned';
import { createActionApi } from '@/server/next/createActionApi';
import { createApiErrorServerSide } from '@/server/next/createApiErrorServerSide';

export async function ItemReturned(id: Parameters<typeof endpoint.ItemReturned>[1]) {
  const res = await endpoint.ItemReturned(createActionApi(), id).catch(createApiErrorServerSide);
  revalidateTag('items');
  return res;
}
