'use server';

import { revalidateTag } from 'next/cache';
import { createApiErrorServerSide } from '@/api/core/ApiError/createApiErrorServerSide';
import * as endpoint from '@/api/endpoints/workers/ToggleActivateWorker';
import { createActionApi } from '@/server/next/createActionApi';

export async function ToggleActivateWorker(
  id: Parameters<typeof endpoint.ToggleActivateWorker>[1],
  payload: Parameters<typeof endpoint.ToggleActivateWorker>[2]
) {
  const res = await endpoint.ToggleActivateWorker(createActionApi(), id, payload).catch(createApiErrorServerSide);
  revalidateTag('workers');
  return res;
}
