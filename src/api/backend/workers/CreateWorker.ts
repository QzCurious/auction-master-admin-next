'use server';

import { revalidateTag } from 'next/cache';
import { createApiErrorServerSide } from '@/api/core/ApiError/createApiErrorServerSide';
import * as endpoint from '@/api/endpoints/workers/CreateWorker';
import { createActionApi } from '@/server/next/createActionApi';

export async function CreateWorker(payload: Parameters<typeof endpoint.CreateWorker>[1]) {
  const res = await endpoint.CreateWorker(createActionApi(), payload).catch(createApiErrorServerSide);
  revalidateTag('workers');
  return res;
}
