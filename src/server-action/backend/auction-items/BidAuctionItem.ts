'use server';

import * as endpoint from '@/api/backend/auction-items/BidAuctionItem';
import { createActionApi } from '@/server/next/createActionApi';
import { createApiErrorServerSide } from '@/server/next/createApiErrorServerSide';
import { revalidateMutation } from '@/server/next/revalidateMutation';

export async function BidAuctionItem(
  id: Parameters<typeof endpoint.BidAuctionItem>[1],
  payload: Parameters<typeof endpoint.BidAuctionItem>[2]
) {
  const res = await endpoint.BidAuctionItem(createActionApi(), id, payload).catch(createApiErrorServerSide);
  if (!res.error) revalidateMutation('BidAuctionItem');
  return res;
}
