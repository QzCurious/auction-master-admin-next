import 'server-only';

import * as endpoint from '@/api/backend/auction-items/GetAuctionItems';
import { createApiErrorServerSide } from '@/server/next/createApiErrorServerSide';
import { createRenderApi } from '@/server/next/createRenderApi';

export async function GetAuctionItems(payload: Parameters<typeof endpoint.GetAuctionItems>[1]) {
  const res = await endpoint
    .GetAuctionItems(createRenderApi().extend({ next: { tags: ['auction-items'] } }), payload)
    .catch(createApiErrorServerSide);

  return res;
}
