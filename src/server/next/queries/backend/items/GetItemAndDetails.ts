import 'server-only';

import * as endpoint from '@/api/backend/items/GetItemAndDetails';
import { createApiErrorServerSide } from '@/server/next/createApiErrorServerSide';
import { createRenderApi } from '@/server/next/createRenderApi';

export async function GetItemAndDetails(id: Parameters<typeof endpoint.GetItemAndDetails>[1]) {
  const res = await endpoint
    .GetItemAndDetails(createRenderApi().extend({ next: { tags: ['items'] } }), id)
    .catch(createApiErrorServerSide);

  return res;
}
