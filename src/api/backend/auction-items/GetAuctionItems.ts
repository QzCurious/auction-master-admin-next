'use server';

import { appendEntries } from '@/domain/crud/appendEntries';
import { type AUCTION_ITEM_STATUS } from '@/domain/static/static-config-mappers';
import { z } from 'zod';

import { apiClient } from '../../apiClient';
import { throwIfInvalid } from '../../helpers/throwIfInvalid';
import { withAuth } from '../../withAuth';

const ReqSchema = z.object({
  consignorId: z.coerce.number().optional(),
  status: z.coerce.number().array().optional(),
  sort: z.string().optional(),
  order: z.enum(['asc', 'desc']).optional(),
  limit: z.coerce.number().default(10),
  offset: z.coerce.number().default(0),
});

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
  }> | null;
  recordId: string;
}

interface Data {
  auctionItems: Array<AuctionItem>;
  count: number;
}

type ErrorCode = never;

export async function GetAuctionItems(payload: z.input<typeof ReqSchema>) {
  const data = throwIfInvalid(payload, ReqSchema);

  const query = new URLSearchParams();
  appendEntries(query, data);

  const res = await withAuth(apiClient)<Data, ErrorCode>(`/backend/auction-items?${query}`, {
    method: 'GET',
    next: { tags: ['auction-items'] },
  });

  return res;
}
