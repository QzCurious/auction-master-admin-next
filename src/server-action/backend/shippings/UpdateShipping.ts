'use server';

import { revalidateTag } from 'next/cache';
import * as endpoint from '@/api/backend/shippings/UpdateShipping';
import { createActionApi } from '@/server/next/createActionApi';
import { createApiErrorServerSide } from '@/server/next/createApiErrorServerSide';

export async function UpdateShipping(
  id: Parameters<typeof endpoint.UpdateShipping>[1],
  payload: Parameters<typeof endpoint.UpdateShipping>[2]
) {
  const res = await endpoint.UpdateShipping(createActionApi(), id, payload).catch(createApiErrorServerSide);
  revalidateTag('shippings');
  revalidateTag('items');
  revalidateTag('auction-items');
  revalidateTag('records');
  revalidateTag('reports');
  revalidateTag('wallets');
  revalidateTag('bonus');
  return res;
}
