'use server';

import { revalidateTag } from 'next/cache';
import { createApiErrorServerSide } from '@/api/core/ApiError/createApiErrorServerSide';
import * as endpoint from '@/api/endpoints/shippings/ProcessingShipping';
import { createActionApi } from '@/server/next/createActionApi';

export async function ProcessingShipping(id: Parameters<typeof endpoint.ProcessingShipping>[1]) {
  const res = await endpoint.ProcessingShipping(createActionApi(), id).catch(createApiErrorServerSide);
  revalidateTag('shippings');
  return res;
}
