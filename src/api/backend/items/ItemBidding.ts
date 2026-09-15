'use server';

import { revalidateTag } from 'next/cache';
import { createApiErrorServerSide } from '@/api/core/ApiError/createApiErrorServerSide';
import * as endpoint from '@/api/endpoints/items/ItemBidding';
import { createActionApi } from '@/server/next/createActionApi';

export async function ItemBidding(
  id: Parameters<typeof endpoint.ItemBidding>[1],
  payload: Parameters<typeof endpoint.ItemBidding>[2]
) {
  const res = await endpoint.ItemBidding(createActionApi(), id, payload).catch(createApiErrorServerSide);
  revalidateTag('items');
  return res;
}
