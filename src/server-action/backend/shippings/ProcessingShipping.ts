'use server';

import { revalidateTag } from 'next/cache';
import * as endpoint from '@/api/backend/shippings/ProcessingShipping';
import { createActionApi } from '@/server/next/createActionApi';
import { createApiErrorServerSide } from '@/server/next/createApiErrorServerSide';

export async function ProcessingShipping(id: Parameters<typeof endpoint.ProcessingShipping>[1]) {
  const res = await endpoint.ProcessingShipping(createActionApi(), id).catch(createApiErrorServerSide);
  revalidateTag('shippings');
  return res;
}
