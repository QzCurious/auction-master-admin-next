'use server';

import * as endpoint from '@/api/backend/consignor/AdminGetConsignor';
import { createActionApi } from '@/server/next/createActionApi';
import { createApiErrorServerSide } from '@/server/next/createApiErrorServerSide';

export async function AdminGetConsignor(id: Parameters<typeof endpoint.AdminGetConsignor>[1]) {
  const res = await endpoint
    .AdminGetConsignor(createActionApi().extend({ next: { tags: ['consignors'] } }), id)
    .catch(createApiErrorServerSide);

  return res;
}
