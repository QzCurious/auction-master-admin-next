'use server';

import { revalidateTag } from 'next/cache';
import * as endpoint from '@/api/backend/shippings/Shipped';
import { createActionApi } from '@/server/next/createActionApi';
import { createApiErrorServerSide } from '@/server/next/createApiErrorServerSide';

export async function Shipped(
  id: Parameters<typeof endpoint.Shipped>[1],
  payload: Parameters<typeof endpoint.Shipped>[2]
) {
  const res = await endpoint.Shipped(createActionApi(), id, payload).catch(createApiErrorServerSide);
  revalidateTag('shippings');
  revalidateTag('items');
  revalidateTag('auction-items');
  revalidateTag('records');
  revalidateTag('reports');
  revalidateTag('wallets');
  revalidateTag('bonus');
  return res;
}
