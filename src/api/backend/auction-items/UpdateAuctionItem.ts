'use server';

import { revalidateTag } from 'next/cache';
import { apiClientWithToken } from '@/api/core/apiClientWithToken';
import { createApiErrorServerSide } from '@/api/core/ApiError/createApiErrorServerSide';
import { throwIfInvalid, type SuccessResponseJson } from '@/api/core/static';
import { appendEntries } from '@/domain/crud/appendEntries';
import { z } from 'zod';

import { type AuctionItem } from './GetAuctionItems';

const ReqSchema = z
  .object({
    auctionId: z.string(),
    consignorId: z.number(),
    itemId: z.number(),
    sellerId: z.number(),
    watcherId: z.number(),
    name: z.string(),
    photo: z.string(),
    reservePrice: z.number(),
    currentPrice: z.number(),
    highestPrice: z.number(),
    closeAt: z.coerce.date(),
    closedPrice: z.number(),
    shippingCostsWithinJapan: z.number(),
    status: z.coerce.number(),
  })
  .partial();

type Data = 'Success';

export async function UpdateAuctionItem(id: AuctionItem['auctionId'], payload: z.input<typeof ReqSchema>) {
  const data = throwIfInvalid(payload, ReqSchema);

  const urlencoded = new URLSearchParams();
  appendEntries(urlencoded, data);

  const res = await apiClientWithToken
    .patch<SuccessResponseJson<Data>>(`backend/auction-items/${id}`, {
      body: urlencoded,
    })
    .json()
    .catch(createApiErrorServerSide);

  revalidateTag('auction-items');

  return res;
}
