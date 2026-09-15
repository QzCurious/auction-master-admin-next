import { type SuccessResponseJson } from '@/api/core/static';
import { type AUCTION_ITEM_STATUS } from '@/domain/static/static-config-mappers';
import { type KyInstance } from 'ky';

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

export async function GetAuctionItem(api: KyInstance, id: AuctionItem['auctionId']) {
  const res = await api.get<SuccessResponseJson<Data>>(`backend/auction-items/${id}`, {}).json();
  return res;
}
