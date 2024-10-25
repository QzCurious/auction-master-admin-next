'use server';

import { revalidateTag } from 'next/cache';
import { apiClientWithToken } from '@/api/core/apiClientWithToken';
import { createApiErrorServerSide } from '@/api/core/ApiError/createApiErrorServerSide';
import { type SuccessResponseJson } from '@/api/core/static';

import { type AuctionItem } from './GetAuctionItems';

type Data = 'Success';

export async function CancelAuctionItem(auctionId: AuctionItem['auctionId']) {
  const res = await apiClientWithToken
    .post<SuccessResponseJson<Data>>(`backend/auction-items/${auctionId}/cancellation`, {})
    .json()
    .catch(createApiErrorServerSide);

  revalidateTag('auction-items');

  return res;
}
