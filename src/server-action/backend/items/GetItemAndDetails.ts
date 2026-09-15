'use server';

import * as endpoint from '@/api/backend/items/GetItemAndDetails';
import { createActionApi } from '@/server/next/createActionApi';
import { createApiErrorServerSide } from '@/server/next/createApiErrorServerSide';

export async function GetItemAndDetails(id: Parameters<typeof endpoint.GetItemAndDetails>[1]) {
  const res = await endpoint
    .GetItemAndDetails(createActionApi().extend({ next: { tags: ['items'] } }), id)
    .catch(createApiErrorServerSide);

  return res;
}
