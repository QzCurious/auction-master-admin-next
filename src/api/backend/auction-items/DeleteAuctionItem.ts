'use server';

import { revalidateTag } from 'next/cache';
import { createApiErrorServerSide } from '@/api/core/ApiError/createApiErrorServerSide';
import * as endpoint from '@/api/endpoints/auction-items/DeleteAuctionItem';
import { createActionApi } from '@/server/next/createActionApi';

export async function DeleteAuctionItem(id: Parameters<typeof endpoint.DeleteAuctionItem>[1]) {
  const res = await endpoint.DeleteAuctionItem(createActionApi(), id).catch(createApiErrorServerSide);
  revalidateTag('auction-items');
  return res;
}
