'use server';

import * as endpoint from '@/api/backend/auction-items/CancelAuctionItem';
import { createActionApi } from '@/server/next/createActionApi';
import { createApiErrorServerSide } from '@/server/next/createApiErrorServerSide';
import { revalidateMutation } from '@/server/next/revalidateMutation';

export async function CancelAuctionItem(auctionId: Parameters<typeof endpoint.CancelAuctionItem>[1]) {
  const res = await endpoint.CancelAuctionItem(createActionApi(), auctionId).catch(createApiErrorServerSide);
  if (!res.error) revalidateMutation('CancelAuctionItem');
  return res;
}
