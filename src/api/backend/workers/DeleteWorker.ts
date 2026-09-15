'use server';

import { revalidateTag } from 'next/cache';
import { createApiErrorServerSide } from '@/api/core/ApiError/createApiErrorServerSide';
import * as endpoint from '@/api/endpoints/workers/DeleteWorker';
import { createActionApi } from '@/server/next/createActionApi';

export async function DeleteWorker(id: Parameters<typeof endpoint.DeleteWorker>[1]) {
  const res = await endpoint.DeleteWorker(createActionApi(), id).catch(createApiErrorServerSide);
  revalidateTag('workers');
  return res;
}
