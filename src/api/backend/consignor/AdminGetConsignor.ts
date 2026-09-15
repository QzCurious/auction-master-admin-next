'use server';

import { createApiErrorServerSide } from '@/api/core/ApiError/createApiErrorServerSide';
import * as endpoint from '@/api/endpoints/consignor/AdminGetConsignor';
import { createActionApi } from '@/server/next/createActionApi';

export type { Consignor } from '@/api/endpoints/consignor/AdminGetConsignor';
export async function AdminGetConsignor(id: Parameters<typeof endpoint.AdminGetConsignor>[1]) {
  const res = await endpoint
    .AdminGetConsignor(createActionApi().extend({ next: { tags: ['consignors'] } }), id)
    .catch(createApiErrorServerSide);

  return res;
}
