import 'server-only';

import * as endpoint from '@/api/backend/shippings/GetShipping';
import { createApiErrorServerSide } from '@/server/next/createApiErrorServerSide';
import { createRenderApi } from '@/server/next/createRenderApi';

export async function GetShipping(id: Parameters<typeof endpoint.GetShipping>[1]) {
  const res = await endpoint
    .GetShipping(createRenderApi().extend({ next: { tags: ['shippings'] } }), id)
    .catch(createApiErrorServerSide);

  return res;
}
