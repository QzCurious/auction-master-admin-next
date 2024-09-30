'use server';

import { revalidateTag } from 'next/cache';
import { apiClient } from '@/api/apiClient';
import { throwIfInvalid } from '@/api/helpers/throwIfInvalid';
import { withAuth } from '@/api/withAuth';
import { appendEntries } from '@/domain/crud/appendEntries';
import { z } from 'zod';

import { type AuctionItem } from './GetAuctionItems';

const ReqSchema = z
  .object({
    consignorID: z.number(),
    itemID: z.number(),
    sellerID: z.number(),
    watcherID: z.number(),
    auctionID: z.string(),
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

type ErrorCode = never;

export async function UpdateAuctionItem(id: AuctionItem['id'], payload: z.input<typeof ReqSchema>) {
  const data = throwIfInvalid(payload, ReqSchema);

  const urlencoded = new URLSearchParams();
  appendEntries(urlencoded, data);

  const res = await withAuth(apiClient)<Data, ErrorCode>(`/backend/auction-items/${id}`, {
    method: 'PATCH',
    body: urlencoded,
  });

  revalidateTag('auction-items');

  return res;
}
