'use server';

import { revalidateTag } from 'next/cache';
import { createApiErrorServerSide } from '@/api/core/ApiError/createApiErrorServerSide';
import * as endpoint from '@/api/endpoints/items/ItemReturning';
import { createActionApi } from '@/server/next/createActionApi';

export async function ItemReturning(payload: Parameters<typeof endpoint.ItemReturning>[1]) {
  const res = await endpoint.ItemReturning(createActionApi(), payload).catch(createApiErrorServerSide);
  revalidateTag('items');
  return res;
}
