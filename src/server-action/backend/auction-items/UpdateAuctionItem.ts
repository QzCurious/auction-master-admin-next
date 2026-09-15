'use server';

import { revalidateTag } from 'next/cache';
import * as endpoint from '@/api/backend/auction-items/UpdateAuctionItem';
import { createActionApi } from '@/server/next/createActionApi';
import { createApiErrorServerSide } from '@/server/next/createApiErrorServerSide';

export async function UpdateAuctionItem(
  id: Parameters<typeof endpoint.UpdateAuctionItem>[1],
  payload: Parameters<typeof endpoint.UpdateAuctionItem>[2]
) {
  const res = await endpoint.UpdateAuctionItem(createActionApi(), id, payload).catch(createApiErrorServerSide);
  revalidateTag('auction-items');
  revalidateTag('items');
  revalidateTag('shippings');
  revalidateTag('records');
  revalidateTag('reports');
  revalidateTag('wallets');
  revalidateTag('bonus');
  return res;
}
