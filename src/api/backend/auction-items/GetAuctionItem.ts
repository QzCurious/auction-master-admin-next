'use server';

import { z } from 'zod';

import { apiClient } from '../../apiClient';
import { withAuth } from '../../withAuth';
import { type AUCTION_ITEM_STATUS } from '../static-configs.data';

const ReqSchema = z.object({
  consignorID: z.coerce.number().optional(),
  status: z.coerce.number().array().optional(),
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
