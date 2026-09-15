'use server';

import * as endpoint from '@/api/backend/auction-items/AuctionItemConsignorFeePaid';
import { createActionApi } from '@/server/next/createActionApi';
import { createApiErrorServerSide } from '@/server/next/createApiErrorServerSide';
import { revalidateMutation } from '@/server/next/revalidateMutation';

export async function AuctionItemConsignorFeePaid(payload: Parameters<typeof endpoint.AuctionItemConsignorFeePaid>[1]) {
  const res = await endpoint.AuctionItemConsignorFeePaid(createActionApi(), payload).catch(createApiErrorServerSide);
  if (!res.error) revalidateMutation('AuctionItemConsignorFeePaid');
  return res;
}
