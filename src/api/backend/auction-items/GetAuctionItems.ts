import 'server-only';

import { createApiErrorServerSide } from '@/api/core/ApiError/createApiErrorServerSide';
import * as endpoint from '@/api/endpoints/auction-items/GetAuctionItems';
import { createRenderApi } from '@/server/next/createRenderApi';

export type { AuctionItem } from '@/api/endpoints/auction-items/GetAuctionItems';
export async function GetAuctionItems(payload: Parameters<typeof endpoint.GetAuctionItems>[1]) {
  const res = await endpoint
    .GetAuctionItems(createRenderApi().extend({ next: { tags: ['auction-items'] } }), payload)
    .catch(createApiErrorServerSide);

  return res;
}
