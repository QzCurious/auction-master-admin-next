'use server';

import * as endpoint from '@/api/backend/auction-items/GetAuctionItem';
import { createActionApi } from '@/server/next/createActionApi';
import { createApiErrorServerSide } from '@/server/next/createApiErrorServerSide';

export async function GetAuctionItem(id: Parameters<typeof endpoint.GetAuctionItem>[1]) {
  const res = await endpoint
    .GetAuctionItem(createActionApi().extend({ next: { tags: ['auction-items'] } }), id)
    .catch(createApiErrorServerSide);

  return res;
}
