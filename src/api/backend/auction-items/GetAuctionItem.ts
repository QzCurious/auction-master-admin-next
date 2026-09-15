'use server';

import { createApiErrorServerSide } from '@/api/core/ApiError/createApiErrorServerSide';
import * as endpoint from '@/api/endpoints/auction-items/GetAuctionItem';
import { createActionApi } from '@/server/next/createActionApi';

export type { AuctionItem } from '@/api/endpoints/auction-items/GetAuctionItem';
export async function GetAuctionItem(id: Parameters<typeof endpoint.GetAuctionItem>[1]) {
  const res = await endpoint
    .GetAuctionItem(createActionApi().extend({ next: { tags: ['auction-items'] } }), id)
    .catch(createApiErrorServerSide);

  return res;
}
