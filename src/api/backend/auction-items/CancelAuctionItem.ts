'use server';

import { revalidateTag } from 'next/cache';
import { apiClient } from '@/api/apiClient';
import { withAuth } from '@/api/withAuth';

import { type AuctionItem } from './GetAuctionItems';

type Data = 'Success';

type ErrorCode = never;

export async function CancelAuctionItem(auctionId: AuctionItem['auctionId']) {
  const res = await withAuth(apiClient)<Data, ErrorCode>(`/backend/auction-items/${auctionId}/cancellation`, {
    method: 'POST',
  });

  revalidateTag('auction-items');

  return res;
}
