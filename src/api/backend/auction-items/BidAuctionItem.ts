'use server';

import { revalidateTag } from 'next/cache';
import { createApiErrorServerSide } from '@/api/core/ApiError/createApiErrorServerSide';
import * as endpoint from '@/api/endpoints/auction-items/BidAuctionItem';
import { createActionApi } from '@/server/next/createActionApi';

export async function BidAuctionItem(
  id: Parameters<typeof endpoint.BidAuctionItem>[1],
  payload: Parameters<typeof endpoint.BidAuctionItem>[2]
) {
  const res = await endpoint.BidAuctionItem(createActionApi(), id, payload).catch(createApiErrorServerSide);
  revalidateTag('auction-items');
  return res;
}
