'use server';

import { revalidateTag } from 'next/cache';
import { createApiErrorServerSide } from '@/api/core/ApiError/createApiErrorServerSide';
import * as endpoint from '@/api/endpoints/shippings/UpdateShipping';
import { createActionApi } from '@/server/next/createActionApi';

export async function UpdateShipping(
  id: Parameters<typeof endpoint.UpdateShipping>[1],
  payload: Parameters<typeof endpoint.UpdateShipping>[2]
) {
  const res = await endpoint.UpdateShipping(createActionApi(), id, payload).catch(createApiErrorServerSide);
  revalidateTag('shippings');
  return res;
}
