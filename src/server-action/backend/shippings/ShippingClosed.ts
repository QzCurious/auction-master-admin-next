'use server';

import { revalidateTag } from 'next/cache';
import * as endpoint from '@/api/backend/shippings/ShippingClosed';
import { createActionApi } from '@/server/next/createActionApi';
import { createApiErrorServerSide } from '@/server/next/createApiErrorServerSide';

export async function ShippingClosed(
  id: Parameters<typeof endpoint.ShippingClosed>[1],
  payload: Parameters<typeof endpoint.ShippingClosed>[2]
) {
  const res = await endpoint.ShippingClosed(createActionApi(), id, payload).catch(createApiErrorServerSide);
  revalidateTag('shippings');
  revalidateTag('items');
  revalidateTag('auction-items');
  revalidateTag('records');
  revalidateTag('reports');
  revalidateTag('wallets');
  revalidateTag('bonus');
  return res;
}
