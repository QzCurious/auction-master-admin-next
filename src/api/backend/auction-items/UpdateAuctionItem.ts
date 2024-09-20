'use server';

import { revalidateTag } from 'next/cache';
import { apiClient } from '@/api/apiClient';
import { throwIfInvalid } from '@/api/helpers/throwIfInvalid';
import { withAuth } from '@/api/withAuth';
import { appendEntries } from '@/domain/crud/appendEntries';
import { z } from 'zod';

import { type AuctionItem } from './GetAuctionItems';

const ReqSchema = z.object({
  watcherID: z.number(),
  sellerID: z.number(),
  reservePrice: z.number(),
});

type Data = 'Success';

type ErrorCode = never;

export async function UpdateAuctionItem(id: AuctionItem['id'], payload: z.input<typeof ReqSchema>) {
  const data = throwIfInvalid(payload, ReqSchema);

  const urlencoded = new URLSearchParams();
  appendEntries(urlencoded, data);

  const res = await withAuth(apiClient)<Data, ErrorCode>(`/auction-items/${id}`, {
    method: 'PATCH',
    body: urlencoded,
  });

  revalidateTag('auction-items');

  return res;
}
