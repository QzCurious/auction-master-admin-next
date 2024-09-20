'use server';

import { revalidateTag } from 'next/cache';
import { throwIfInvalid } from '@/api/helpers/throwIfInvalid';
import { appendEntries } from '@/domain/crud/appendEntries';
import { z } from 'zod';

import { apiClient } from '../../apiClient';
import { withAuth } from '../../withAuth';

const ReqSchema = z.object({
  auctionID: z.string(),
});

type Data = 'Success';

type ErrorCode =
  // auction item not closed
  '1025';

export async function ItemBidding(id: number, payload: z.input<typeof ReqSchema>) {
  const data = throwIfInvalid(payload, ReqSchema);

  const urlencoded = new URLSearchParams();
  appendEntries(urlencoded, data);

  const res = await withAuth(apiClient)<Data, ErrorCode>(`/items/${id}/bidding`, {
    method: 'POST',
    body: urlencoded,
  });

  revalidateTag('items');

  return res;
}
