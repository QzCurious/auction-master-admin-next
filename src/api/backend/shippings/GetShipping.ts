import 'server-only';

import { createApiErrorServerSide } from '@/api/core/ApiError/createApiErrorServerSide';
import * as endpoint from '@/api/endpoints/shippings/GetShipping';
import { createRenderApi } from '@/server/next/createRenderApi';

export type { Shipping } from '@/api/endpoints/shippings/GetShipping';
export async function GetShipping(id: Parameters<typeof endpoint.GetShipping>[1]) {
  const res = await endpoint
    .GetShipping(createRenderApi().extend({ next: { tags: ['shippings'] } }), id)
    .catch(createApiErrorServerSide);

  return res;
}
