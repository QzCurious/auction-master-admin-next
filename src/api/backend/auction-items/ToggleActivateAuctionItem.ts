'use server';

import { revalidateTag } from 'next/cache';
import { createApiErrorServerSide } from '@/api/core/ApiError/createApiErrorServerSide';
import * as endpoint from '@/api/endpoints/auction-items/ToggleActivateAuctionItem';
import { createActionApi } from '@/server/next/createActionApi';

export async function ToggleActivateAuctionItem(
  id: Parameters<typeof endpoint.ToggleActivateAuctionItem>[1],
  status: Parameters<typeof endpoint.ToggleActivateAuctionItem>[2]
) {
  const res = await endpoint.ToggleActivateAuctionItem(createActionApi(), id, status).catch(createApiErrorServerSide);
  revalidateTag('auction-items');
  return res;
}
