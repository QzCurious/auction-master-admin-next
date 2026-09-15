'use server';

import * as endpoint from '@/api/backend/auction-items/DeleteAuctionItem';
import { createActionApi } from '@/server/next/createActionApi';
import { createApiErrorServerSide } from '@/server/next/createApiErrorServerSide';
import { revalidateMutation } from '@/server/next/revalidateMutation';

export async function DeleteAuctionItem(id: Parameters<typeof endpoint.DeleteAuctionItem>[1]) {
  const res = await endpoint.DeleteAuctionItem(createActionApi(), id).catch(createApiErrorServerSide);
  if (!res.error) revalidateMutation('DeleteAuctionItem');
  return res;
}
