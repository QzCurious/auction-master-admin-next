'use server';

import { revalidateTag } from 'next/cache';
import * as endpoint from '@/api/backend/items/ItemBidding';
import { createActionApi } from '@/server/next/createActionApi';
import { createApiErrorServerSide } from '@/server/next/createApiErrorServerSide';

export async function ItemBidding(
  id: Parameters<typeof endpoint.ItemBidding>[1],
  payload: Parameters<typeof endpoint.ItemBidding>[2]
) {
  const res = await endpoint.ItemBidding(createActionApi(), id, payload).catch(createApiErrorServerSide);
  revalidateTag('items');
  revalidateTag('auction-items');
  revalidateTag('shippings');
  revalidateTag('records');
  revalidateTag('reports');
  revalidateTag('wallets');
  revalidateTag('bonus');
  return res;
}
