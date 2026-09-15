import 'server-only';

import * as endpoint from '@/api/backend/consignor/AdminGetConsignors';
import { createApiErrorServerSide } from '@/server/next/createApiErrorServerSide';
import { createRenderApi } from '@/server/next/createRenderApi';

export async function AdminGetConsignors(payload: Parameters<typeof endpoint.AdminGetConsignors>[1]) {
  const res = await endpoint
    .AdminGetConsignors(createRenderApi().extend({ next: { tags: ['consignors'] } }), payload)
    .catch(createApiErrorServerSide);

  return res;
}
