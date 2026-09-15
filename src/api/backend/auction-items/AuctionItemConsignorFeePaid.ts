'use server';

import { revalidateTag } from 'next/cache';
import { createApiErrorServerSide } from '@/api/core/ApiError/createApiErrorServerSide';
import * as endpoint from '@/api/endpoints/auction-items/AuctionItemConsignorFeePaid';
import { createActionApi } from '@/server/next/createActionApi';

export async function AuctionItemConsignorFeePaid(payload: Parameters<typeof endpoint.AuctionItemConsignorFeePaid>[1]) {
  const res = await endpoint.AuctionItemConsignorFeePaid(createActionApi(), payload).catch(createApiErrorServerSide);
  revalidateTag('auction-items');
  return res;
}
