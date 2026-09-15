'use server';

import * as endpoint from '@/api/backend/consignor/AdminGetConsignors';
import { createActionApi } from '@/server/next/createActionApi';
import { createApiErrorServerSide } from '@/server/next/createApiErrorServerSide';

export async function AdminGetConsignors(payload: Parameters<typeof endpoint.AdminGetConsignors>[1]) {
  const res = await endpoint
    .AdminGetConsignors(createActionApi().extend({ next: { tags: ['consignors'] } }), payload)
    .catch(createApiErrorServerSide);

  return res;
}
