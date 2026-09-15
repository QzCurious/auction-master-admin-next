'use server';

import * as endpoint from '@/api/backend/auction-items/ToggleActivateAuctionItem';
import { createActionApi } from '@/server/next/createActionApi';
import { createApiErrorServerSide } from '@/server/next/createApiErrorServerSide';
import { revalidateMutation } from '@/server/next/revalidateMutation';

export async function ToggleActivateAuctionItem(
  id: Parameters<typeof endpoint.ToggleActivateAuctionItem>[1],
  status: Parameters<typeof endpoint.ToggleActivateAuctionItem>[2]
) {
  const res = await endpoint.ToggleActivateAuctionItem(createActionApi(), id, status).catch(createApiErrorServerSide);
  if (!res.error) revalidateMutation('ToggleActivateAuctionItem');
  return res;
}
