import 'server-only';

import * as endpoint from '@/api/backend/consignor/AdminGetConsignorVerifications';
import { createApiErrorServerSide } from '@/server/next/createApiErrorServerSide';
import { createRenderApi } from '@/server/next/createRenderApi';

export async function AdminGetConsignorVerifications(
  payload: Parameters<typeof endpoint.AdminGetConsignorVerifications>[1]
) {
  const res = await endpoint
    .AdminGetConsignorVerifications(createRenderApi().extend({ next: { tags: ['consignorsVerifications'] } }), payload)
    .catch(createApiErrorServerSide);

  return res;
}
