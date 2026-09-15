'use server';

import { revalidateTag } from 'next/cache';
import { createApiErrorServerSide } from '@/api/core/ApiError/createApiErrorServerSide';
import * as endpoint from '@/api/endpoints/shippings/ShippingClosed';
import { createActionApi } from '@/server/next/createActionApi';

export async function ShippingClosed(
  id: Parameters<typeof endpoint.ShippingClosed>[1],
  payload: Parameters<typeof endpoint.ShippingClosed>[2]
) {
  const res = await endpoint.ShippingClosed(createActionApi(), id, payload).catch(createApiErrorServerSide);
  revalidateTag('shippings');
  return res;
}
