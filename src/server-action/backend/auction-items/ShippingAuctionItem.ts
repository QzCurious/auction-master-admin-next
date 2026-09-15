'use server';

import { revalidateTag } from 'next/cache';
import * as endpoint from '@/api/backend/auction-items/ShippingAuctionItem';
import { createActionApi } from '@/server/next/createActionApi';
import { createApiErrorServerSide } from '@/server/next/createApiErrorServerSide';

export async function ShippingAuctionItem(payload: Parameters<typeof endpoint.ShippingAuctionItem>[1]) {
  const res = await endpoint.ShippingAuctionItem(createActionApi(), payload).catch(createApiErrorServerSide);
  revalidateTag('auction-items');
  revalidateTag('items');
  revalidateTag('shippings');
  revalidateTag('records');
  revalidateTag('reports');
  revalidateTag('wallets');
  revalidateTag('bonus');
  return res;
}
