'use server';

import { revalidateTag } from 'next/cache';
import { createApiErrorServerSide } from '@/api/core/ApiError/createApiErrorServerSide';
import * as endpoint from '@/api/endpoints/auction-items/CancelAuctionItem';
import { createActionApi } from '@/server/next/createActionApi';

export async function CancelAuctionItem(auctionId: Parameters<typeof endpoint.CancelAuctionItem>[1]) {
  const res = await endpoint.CancelAuctionItem(createActionApi(), auctionId).catch(createApiErrorServerSide);
  revalidateTag('auction-items');
  return res;
}
