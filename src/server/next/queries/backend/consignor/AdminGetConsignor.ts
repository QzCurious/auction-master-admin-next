import 'server-only';

import * as endpoint from '@/api/backend/consignor/AdminGetConsignor';
import { createApiErrorServerSide } from '@/server/next/createApiErrorServerSide';
import { createRenderApi } from '@/server/next/createRenderApi';

export async function AdminGetConsignor(id: Parameters<typeof endpoint.AdminGetConsignor>[1]) {
  const res = await endpoint
    .AdminGetConsignor(createRenderApi().extend({ next: { tags: ['consignors'] } }), id)
    .catch(createApiErrorServerSide);

  return res;
}
