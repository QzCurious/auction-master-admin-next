'use server';

import { revalidateTag } from 'next/cache';
import { apiClientWithToken } from '@/api/core/apiClientWithToken';
import { createApiErrorServerSide } from '@/api/core/ApiError/createApiErrorServerSide';
import { throwIfInvalid, type SuccessResponseJson } from '@/api/core/static';
import { appendEntries } from '@/domain/crud/appendEntries';
import { z } from 'zod';

import { type AuctionItem } from './GetAuctionItems';

const ReqSchema = z.object({
  price: z.number(),
});

type Data = 'Success';

export async function BidAuctionItem(id: AuctionItem['auctionId'], payload: z.input<typeof ReqSchema>) {
  const data = throwIfInvalid(payload, ReqSchema);

  const urlencoded = new URLSearchParams();
  appendEntries(urlencoded, data);

  const res = await apiClientWithToken
    .post<SuccessResponseJson<Data>>(`backend/auction-items/${id}/bid`, {
      body: urlencoded,
    })
    .json()
    .catch(createApiErrorServerSide);

  revalidateTag('auction-items');

  return res;
}
