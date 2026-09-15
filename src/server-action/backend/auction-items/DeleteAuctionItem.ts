'use server';

import { revalidateTag } from 'next/cache';
import * as endpoint from '@/api/backend/auction-items/DeleteAuctionItem';
import { createActionApi } from '@/server/next/createActionApi';
import { createApiErrorServerSide } from '@/server/next/createApiErrorServerSide';

export async function DeleteAuctionItem(id: Parameters<typeof endpoint.DeleteAuctionItem>[1]) {
  const res = await endpoint.DeleteAuctionItem(createActionApi(), id).catch(createApiErrorServerSide);
  revalidateTag('auction-items');
  return res;
}
