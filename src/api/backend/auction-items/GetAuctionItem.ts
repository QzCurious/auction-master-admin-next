/* eslint-disable import/named */
'use server';

import { cache } from 'react';
import { apiClientWithToken } from '@/api/core/apiClientWithToken';
import { createApiErrorServerSide } from '@/api/core/ApiError/createApiErrorServerSide';
import { type SuccessResponseJson } from '@/api/core/static';
import { type AUCTION_ITEM_STATUS } from '@/domain/static/static-config-mappers';

export interface AuctionItem {
  auctionId: string;
  consignorId: number;
  itemId: number;
  sellerId: number;
  watcherId: number;
  name: string;
  photo: string;
  reservePrice: number;
  currentPrice: number;
  highestPrice: number;
  closeAt: string;
  closedPrice: number;
  shippingCostsWithinJapan: number;
  status: AUCTION_ITEM_STATUS['value'];
  createdAt: string;
  updatedAt: string;
  consignorNickname: string;
  sellerName: string;
  watcherName: string;
  bidders: Array<{
    account: string;
    rating: number;
    bidAmount: number;
    quantity: number;
    lastBidAt: string;
  }>;
  recordId: string;
}

type Data = AuctionItem;

async function GetAuctionItem(id: AuctionItem['auctionId']) {
  const res = await apiClientWithToken
    .get<SuccessResponseJson<Data>>(`backend/auction-items/${id}`, {
      next: { tags: ['auction-items'] },
    })
    .json()
    .catch(createApiErrorServerSide);

  return res;
}

const CachedGetAuctionItem = cache(GetAuctionItem);

export { CachedGetAuctionItem as GetAuctionItem };
