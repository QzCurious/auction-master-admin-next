'use server';

import { type AUCTION_ITEM_STATUS } from '@/domain/static/static-config-mappers';

import { apiClient } from '../../apiClient';
import { withAuth } from '../../withAuth';

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

type ErrorCode =
  // get auction item error
  '21';

export async function GetAuctionItem(id: AuctionItem['auctionId']) {
  const res = await withAuth(apiClient)<Data, ErrorCode>(`/backend/auction-items/${id}`, {
    method: 'GET',
    next: { tags: ['auction-items'] },
  });

  return res;
}
