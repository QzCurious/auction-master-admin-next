'use server';

import { createApiErrorServerSide } from '@/api/core/ApiError/createApiErrorServerSide';
import * as endpoint from '@/api/endpoints/workers/GetWorkers';
import { createActionApi } from '@/server/next/createActionApi';

export type { Worker } from '@/api/endpoints/workers/GetWorkers';
export async function GetWorkers(payload: Parameters<typeof endpoint.GetWorkers>[1]) {
  const res = await endpoint
    .GetWorkers(createActionApi().extend({ next: { tags: ['workers'] } }), payload)
    .catch(createApiErrorServerSide);

  return res;
}
