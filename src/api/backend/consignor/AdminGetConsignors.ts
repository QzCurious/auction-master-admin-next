'use server';

import { createApiErrorServerSide } from '@/api/core/ApiError/createApiErrorServerSide';
import * as endpoint from '@/api/endpoints/consignor/AdminGetConsignors';
import { createActionApi } from '@/server/next/createActionApi';

export type { Consignor } from '@/api/endpoints/consignor/AdminGetConsignors';
export async function AdminGetConsignors(payload: Parameters<typeof endpoint.AdminGetConsignors>[1]) {
  const res = await endpoint
    .AdminGetConsignors(createActionApi().extend({ next: { tags: ['consignors'] } }), payload)
    .catch(createApiErrorServerSide);

  return res;
}
