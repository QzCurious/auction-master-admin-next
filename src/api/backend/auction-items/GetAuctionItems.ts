'use server';

import { z } from 'zod';

import { apiClient } from '../../apiClient';
import { throwIfInvalid } from '../../helpers/throwIfInvalid';
import { withAuth } from '../../withAuth';
import { type AUCTION_ITEM_STATUS } from '../static-configs.data';

const ReqSchema = z.object({
  consignorID: z.coerce.number().optional(),
  status: z.coerce.number().array().optional(),
  sort: z.string().optional(),
  order: z.enum(['asc', 'desc']).optional(),
  limit: z.coerce.number().default(10),
  offset: z.coerce.number().default(0),
});

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

interface Data {
  auctionItems: Array<AuctionItem>;
  count: number;
}

type ErrorCode = never;

export async function GetAuctionItems(payload: z.input<typeof ReqSchema>) {
  const parsed = throwIfInvalid(payload, ReqSchema);

  const query = new URLSearchParams();
  parsed.consignorID != null && query.append('consignorID', parsed.consignorID.toString());
  for (const status of parsed.status ?? []) {
    query.append('status', status.toString());
  }
  parsed.sort != null && query.append('sort', parsed.sort);
  parsed.order != null && query.append('order', parsed.order);
  parsed.limit != null && query.append('limit', parsed.limit.toString());
  parsed.offset != null && query.append('offset', parsed.offset.toString());

  const res = await withAuth(apiClient)<Data, ErrorCode>(`/auction-items?${query}`, {
    method: 'GET',
    next: { tags: ['auction-items'] },
  });

  return res;
}
