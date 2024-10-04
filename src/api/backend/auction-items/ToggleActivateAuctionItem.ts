'use server';

import { revalidateTag } from 'next/cache';
import { apiClient } from '@/api/apiClient';
import { withAuth } from '@/api/withAuth';

import { type AuctionItem } from './GetAuctionItems';

type Data = 'Success';

type ErrorCode = never;

export async function ToggleActivateAuctionItem(id: AuctionItem['auctionId'], status: AuctionItem['status']) {
  const res = await withAuth(apiClient)<Data, ErrorCode>(`/backend/auction-items/${id}/${status}`, {
    method: 'PATCH',
  });

  revalidateTag('auction-items');

  return res;
}
