'use server';

import { revalidateTag } from 'next/cache';
import * as endpoint from '@/api/backend/auction-items/CancelAuctionItem';
import { createActionApi } from '@/server/next/createActionApi';
import { createApiErrorServerSide } from '@/server/next/createApiErrorServerSide';

export async function CancelAuctionItem(auctionId: Parameters<typeof endpoint.CancelAuctionItem>[1]) {
  const res = await endpoint.CancelAuctionItem(createActionApi(), auctionId).catch(createApiErrorServerSide);
  revalidateTag('auction-items');
  return res;
}
