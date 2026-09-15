'use server';

import { createApiErrorServerSide } from '@/api/core/ApiError/createApiErrorServerSide';
import * as endpoint from '@/api/endpoints/items/GetItemAndDetails';
import { createActionApi } from '@/server/next/createActionApi';

export type { Item } from '@/api/endpoints/items/GetItemAndDetails';
export async function GetItemAndDetails(id: Parameters<typeof endpoint.GetItemAndDetails>[1]) {
  const res = await endpoint
    .GetItemAndDetails(createActionApi().extend({ next: { tags: ['items'] } }), id)
    .catch(createApiErrorServerSide);

  return res;
}
