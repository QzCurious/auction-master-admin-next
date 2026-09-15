'use server';

import { revalidateTag } from 'next/cache';
import * as endpoint from '@/api/backend/auction-items/BidAuctionItem';
import { createActionApi } from '@/server/next/createActionApi';
import { createApiErrorServerSide } from '@/server/next/createApiErrorServerSide';

export async function BidAuctionItem(
  id: Parameters<typeof endpoint.BidAuctionItem>[1],
  payload: Parameters<typeof endpoint.BidAuctionItem>[2]
) {
  const res = await endpoint.BidAuctionItem(createActionApi(), id, payload).catch(createApiErrorServerSide);
  revalidateTag('auction-items');
  return res;
}
