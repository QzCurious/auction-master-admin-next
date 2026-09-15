import 'server-only';

import { createApiErrorServerSide } from '@/api/core/ApiError/createApiErrorServerSide';
import * as endpoint from '@/api/endpoints/shippings/GetShippings';
import { createRenderApi } from '@/server/next/createRenderApi';

export type { Shipping } from '@/api/endpoints/shippings/GetShippings';
export async function GetShippings(payload: Parameters<typeof endpoint.GetShippings>[1]) {
  const res = await endpoint
    .GetShippings(createRenderApi().extend({ next: { tags: ['shippings'] } }), payload)
    .catch(createApiErrorServerSide);

  return res;
}
