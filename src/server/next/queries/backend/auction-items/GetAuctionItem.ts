import 'server-only';

// React's server-only cache export is provided by Next.js.
// eslint-disable-next-line import/named
import { cache } from 'react';
import * as endpoint from '@/api/backend/auction-items/GetAuctionItem';
import { createApiErrorServerSide } from '@/server/next/createApiErrorServerSide';
import { createRenderApi } from '@/server/next/createRenderApi';

async function GetAuctionItem(id: Parameters<typeof endpoint.GetAuctionItem>[1]) {
  const res = await endpoint
    .GetAuctionItem(createRenderApi().extend({ next: { tags: ['auction-items'] } }), id)
    .catch(createApiErrorServerSide);

  return res;
}
const CachedGetAuctionItem = cache(GetAuctionItem);
export { CachedGetAuctionItem as GetAuctionItem };
