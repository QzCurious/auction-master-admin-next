import 'server-only';

import { createApiErrorServerSide } from '@/api/core/ApiError/createApiErrorServerSide';
import * as endpoint from '@/api/endpoints/workers/GetWorker';
import { createRenderApi } from '@/server/next/createRenderApi';

export type { Worker } from '@/api/endpoints/workers/GetWorker';
export async function GetWorker(id: Parameters<typeof endpoint.GetWorker>[1]) {
  const res = await endpoint
    .GetWorker(createRenderApi().extend({ next: { tags: ['workers'] } }), id)
    .catch(createApiErrorServerSide);

  return res;
}
