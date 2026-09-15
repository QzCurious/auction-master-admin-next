import 'server-only';

import { createApiErrorServerSide } from '@/api/core/ApiError/createApiErrorServerSide';
import * as endpoint from '@/api/endpoints/consignor/AdminGetConsignorVerifications';
import { createRenderApi } from '@/server/next/createRenderApi';

export type { ConsignorVerification } from '@/api/endpoints/consignor/AdminGetConsignorVerifications';
export async function AdminGetConsignorVerifications(
  payload: Parameters<typeof endpoint.AdminGetConsignorVerifications>[1]
) {
  const res = await endpoint
    .AdminGetConsignorVerifications(createRenderApi().extend({ next: { tags: ['consignorsVerifications'] } }), payload)
    .catch(createApiErrorServerSide);

  return res;
}
