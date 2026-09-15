import 'server-only';

import * as endpoint from '@/api/backend/workers/GetWorker';
import { createApiErrorServerSide } from '@/server/next/createApiErrorServerSide';
import { createRenderApi } from '@/server/next/createRenderApi';

export async function GetWorker(id: Parameters<typeof endpoint.GetWorker>[1]) {
  const res = await endpoint
    .GetWorker(createRenderApi().extend({ next: { tags: ['workers'] } }), id)
    .catch(createApiErrorServerSide);

  return res;
}
