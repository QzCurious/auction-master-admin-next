'use server';

import * as endpoint from '@/api/backend/workers/GetWorkers';
import { createActionApi } from '@/server/next/createActionApi';
import { createApiErrorServerSide } from '@/server/next/createApiErrorServerSide';

export async function GetWorkers(payload: Parameters<typeof endpoint.GetWorkers>[1]) {
  const res = await endpoint
    .GetWorkers(createActionApi().extend({ next: { tags: ['workers'] } }), payload)
    .catch(createApiErrorServerSide);

  return res;
}
