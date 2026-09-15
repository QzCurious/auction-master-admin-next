import 'server-only';

import * as endpoint from '@/api/backend/workers/GetWorkers';
import { createApiErrorServerSide } from '@/server/next/createApiErrorServerSide';
import { createRenderApi } from '@/server/next/createRenderApi';

export async function GetWorkers(payload: Parameters<typeof endpoint.GetWorkers>[1]) {
  const res = await endpoint
    .GetWorkers(createRenderApi().extend({ next: { tags: ['workers'] } }), payload)
    .catch(createApiErrorServerSide);

  return res;
}
