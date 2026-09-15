import 'server-only';

import * as endpoint from '@/api/backend/workers/GetActivationWorkers';
import { createApiErrorServerSide } from '@/server/next/createApiErrorServerSide';
import { createRenderApi } from '@/server/next/createRenderApi';

export async function GetActivationWorkers() {
  const res = await endpoint
    .GetActivationWorkers(createRenderApi().extend({ next: { tags: ['workers'] } }))
    .catch(createApiErrorServerSide);

  return res;
}
