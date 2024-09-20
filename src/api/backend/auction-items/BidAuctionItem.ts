'use server';

import { revalidateTag } from 'next/cache';
import { apiClient } from '@/api/apiClient';
import { throwIfInvalid } from '@/api/helpers/throwIfInvalid';
import { withAuth } from '@/api/withAuth';
import { appendEntries } from '@/domain/crud/appendEntries';
import { z } from 'zod';

import { type AuctionItem } from './GetAuctionItems';

const ReqSchema = z.object({
  price: z.number(),
});

type Data = 'Success';

type ErrorCode =
  // yahoo jp bid error
  '1401';

export async function BidAuctionItem(id: AuctionItem['id'], payload: z.input<typeof ReqSchema>) {
  const data = throwIfInvalid(payload, ReqSchema);

  const urlencoded = new URLSearchParams();
  appendEntries(urlencoded, data);

  const res = await withAuth(apiClient)<Data, ErrorCode>(`/auction-items/${id}/bid`, {
    method: 'POST',
    body: urlencoded,
  });

  revalidateTag('auction-items');

  return res;
}
