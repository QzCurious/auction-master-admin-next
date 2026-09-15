'use server';

import { revalidateTag } from 'next/cache';
import * as endpoint from '@/api/backend/items/ItemReturning';
import { createActionApi } from '@/server/next/createActionApi';
import { createApiErrorServerSide } from '@/server/next/createApiErrorServerSide';

export async function ItemReturning(payload: Parameters<typeof endpoint.ItemReturning>[1]) {
  const res = await endpoint.ItemReturning(createActionApi(), payload).catch(createApiErrorServerSide);
  revalidateTag('items');
  revalidateTag('auction-items');
  revalidateTag('shippings');
  revalidateTag('records');
  revalidateTag('reports');
  revalidateTag('wallets');
  revalidateTag('bonus');
  return res;
}
