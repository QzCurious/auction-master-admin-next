'use server';

import { revalidateTag } from 'next/cache';
import * as endpoint from '@/api/backend/workers/UpdateWorker';
import { createActionApi } from '@/server/next/createActionApi';
import { createApiErrorServerSide } from '@/server/next/createApiErrorServerSide';

export async function UpdateWorker(
  id: Parameters<typeof endpoint.UpdateWorker>[1],
  payload: Parameters<typeof endpoint.UpdateWorker>[2]
) {
  const res = await endpoint.UpdateWorker(createActionApi(), id, payload).catch(createApiErrorServerSide);
  revalidateTag('workers');
  return res;
}
