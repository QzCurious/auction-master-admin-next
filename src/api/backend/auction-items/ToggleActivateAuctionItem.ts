'use server';

import { revalidateTag } from 'next/cache';
import { apiClientWithToken } from '@/api/core/apiClientWithToken';
import { createApiErrorServerSide } from '@/api/core/ApiError/createApiErrorServerSide';
import { type SuccessResponseJson } from '@/api/core/static';

import { type AuctionItem } from './GetAuctionItems';

type Data = 'Success';

export async function ToggleActivateAuctionItem(id: AuctionItem['auctionId'], status: AuctionItem['status']) {
  const res = await apiClientWithToken
    .patch<SuccessResponseJson<Data>>(`backend/auction-items/${id}/${status}`)
    .json()
    .catch(createApiErrorServerSide);

  revalidateTag('auction-items');

  return res;
}
