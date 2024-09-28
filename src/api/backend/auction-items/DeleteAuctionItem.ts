'use server';

import { revalidateTag } from 'next/cache';
import { apiClient } from '@/api/apiClient';
import { withAuth } from '@/api/withAuth';

import { type AuctionItem } from './GetAuctionItems';

type Data = 'Success';

type ErrorCode = never;

export async function DeleteAuctionItem(id: AuctionItem['id']) {
  const res = await withAuth(apiClient)<Data, ErrorCode>(`/backend/auction-items/${id}`, {
    method: 'DELETE',
  });

  revalidateTag('auction-items');

  return res;
}
