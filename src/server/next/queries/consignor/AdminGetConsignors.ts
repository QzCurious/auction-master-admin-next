import 'server-only';

import { createApiErrorServerSide } from '@/api/core/ApiError/createApiErrorServerSide';
import * as endpoint from '@/api/endpoints/consignor/AdminGetConsignors';
import { createRenderApi } from '@/server/next/createRenderApi';

export type { Consignor } from '@/api/endpoints/consignor/AdminGetConsignors';
export async function AdminGetConsignors(payload: Parameters<typeof endpoint.AdminGetConsignors>[1]) {
  const res = await endpoint
    .AdminGetConsignors(createRenderApi().extend({ next: { tags: ['consignors'] } }), payload)
    .catch(createApiErrorServerSide);

  return res;
}
