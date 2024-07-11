'use server';

import { revalidateTag } from 'next/cache';
import { throwIfInvalid } from '@/api/helpers/throwIfInvalid';
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

  const formData = new FormData();
  formData.append('auctionID', data.auctionID);

  const res = await withAuth(apiClient)<Data, ErrorCode>(`/items/${id}/bidding`, {
    method: 'POST',
    body: formData,
  });

  revalidateTag('items');

  return res;
}
