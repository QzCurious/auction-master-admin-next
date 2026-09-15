'use server';

import * as endpoint from '@/api/backend/auction-items/UpdateAuctionItem';
import { createActionApi } from '@/server/next/createActionApi';
import { createApiErrorServerSide } from '@/server/next/createApiErrorServerSide';
import { revalidateMutation } from '@/server/next/revalidateMutation';

export async function UpdateAuctionItem(
  id: Parameters<typeof endpoint.UpdateAuctionItem>[1],
  payload: Parameters<typeof endpoint.UpdateAuctionItem>[2]
) {
  const res = await endpoint.UpdateAuctionItem(createActionApi(), id, payload).catch(createApiErrorServerSide);
  if (!res.error) revalidateMutation('UpdateAuctionItem');
  return res;
}
