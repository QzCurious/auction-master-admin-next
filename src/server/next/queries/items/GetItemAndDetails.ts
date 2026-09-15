import 'server-only';

import { createApiErrorServerSide } from '@/api/core/ApiError/createApiErrorServerSide';
import * as endpoint from '@/api/endpoints/items/GetItemAndDetails';
import { createRenderApi } from '@/server/next/createRenderApi';

export type { Item } from '@/api/endpoints/items/GetItemAndDetails';
export async function GetItemAndDetails(id: Parameters<typeof endpoint.GetItemAndDetails>[1]) {
  const res = await endpoint
    .GetItemAndDetails(createRenderApi().extend({ next: { tags: ['items'] } }), id)
    .catch(createApiErrorServerSide);

  return res;
}
