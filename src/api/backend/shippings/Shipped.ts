'use server';

import { revalidateTag } from 'next/cache';
import { createApiErrorServerSide } from '@/api/core/ApiError/createApiErrorServerSide';
import * as endpoint from '@/api/endpoints/shippings/Shipped';
import { createActionApi } from '@/server/next/createActionApi';

export async function Shipped(
  id: Parameters<typeof endpoint.Shipped>[1],
  payload: Parameters<typeof endpoint.Shipped>[2]
) {
  const res = await endpoint.Shipped(createActionApi(), id, payload).catch(createApiErrorServerSide);
  revalidateTag('shippings');
  return res;
}
