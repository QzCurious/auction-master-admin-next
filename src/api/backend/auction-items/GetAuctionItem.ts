'use server';

import { apiClient } from '../../apiClient';
import { withAuth } from '../../withAuth';
import { type AUCTION_ITEM_STATUS } from '../static-configs.data';

export interface AuctionItem {
  id: number;
  consignorID: number;
  itemID: number;
  sellerID: number;
  watcherID: number;
  auctionID: string;
  name: string;
  photo: string;
  reservePrice: number;
  currentPrice: number;
  highestPrice: number;
  closeAt: string;
  closedPrice: number;
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
  recordID: string;
}

type Data = AuctionItem;

type ErrorCode = never;

export async function GetAuctionItem(id: number) {
  const res = await withAuth(apiClient)<Data, ErrorCode>(`/auction-items/${id}`, {
    method: 'GET',
    next: { tags: ['auction-items'] },
  });

  return res;
}
