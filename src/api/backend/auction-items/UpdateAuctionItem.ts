'use server';

import { revalidateTag } from 'next/cache';
import { createApiErrorServerSide } from '@/api/core/ApiError/createApiErrorServerSide';
import * as endpoint from '@/api/endpoints/auction-items/UpdateAuctionItem';
import { createActionApi } from '@/server/next/createActionApi';

export async function UpdateAuctionItem(
  id: Parameters<typeof endpoint.UpdateAuctionItem>[1],
  payload: Parameters<typeof endpoint.UpdateAuctionItem>[2]
) {
  const res = await endpoint.UpdateAuctionItem(createActionApi(), id, payload).catch(createApiErrorServerSide);
  revalidateTag('auction-items');
  return res;
}
