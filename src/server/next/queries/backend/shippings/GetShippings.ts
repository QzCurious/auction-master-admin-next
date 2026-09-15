import 'server-only';

import * as endpoint from '@/api/backend/shippings/GetShippings';
import { createApiErrorServerSide } from '@/server/next/createApiErrorServerSide';
import { createRenderApi } from '@/server/next/createRenderApi';

export async function GetShippings(payload: Parameters<typeof endpoint.GetShippings>[1]) {
  const res = await endpoint
    .GetShippings(createRenderApi().extend({ next: { tags: ['shippings'] } }), payload)
    .catch(createApiErrorServerSide);

  return res;
}
