'use server';

import * as endpoint from '@/api/backend/auction-items/ShippingAuctionItem';
import { createActionApi } from '@/server/next/createActionApi';
import { createApiErrorServerSide } from '@/server/next/createApiErrorServerSide';
import { revalidateMutation } from '@/server/next/revalidateMutation';

export async function ShippingAuctionItem(payload: Parameters<typeof endpoint.ShippingAuctionItem>[1]) {
  const res = await endpoint.ShippingAuctionItem(createActionApi(), payload).catch(createApiErrorServerSide);
  if (!res.error) revalidateMutation('ShippingAuctionItem');
  return res;
}
