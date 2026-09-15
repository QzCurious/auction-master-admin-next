import 'server-only';

import { createApiErrorServerSide } from '@/api/core/ApiError/createApiErrorServerSide';
import * as endpoint from '@/api/endpoints/workers/GetActivationWorkers';
import { createRenderApi } from '@/server/next/createRenderApi';

export type { Worker } from '@/api/endpoints/workers/GetActivationWorkers';
export async function GetActivationWorkers() {
  const res = await endpoint
    .GetActivationWorkers(createRenderApi().extend({ next: { tags: ['workers'] } }))
    .catch(createApiErrorServerSide);

  return res;
}
