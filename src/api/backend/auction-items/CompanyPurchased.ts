'use server';

import { revalidateTag } from 'next/cache';
import { apiClient } from '@/api/apiClient';
import { withAuth } from '@/api/withAuth';

import { type AuctionItem } from './GetAuctionItems';

type Data = 'Success';

type ErrorCode = never;

export async function CompanyPurchased(id: AuctionItem['id']) {
  const res = await withAuth(apiClient)<Data, ErrorCode>(`/backend/auction-items/${id}/company-purchased`, {
    method: 'POST',
  });

  revalidateTag('auction-items');

  return res;
}
