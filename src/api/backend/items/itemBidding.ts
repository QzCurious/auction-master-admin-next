'use server';

import { revalidateTag } from 'next/cache';
import { throwIfInvalid } from '@/api/helpers/throwIfInvalid';
import { z } from 'zod';

import { apiClient } from '../../apiClient';
import { withAuth } from '../../withAuth';

const ReqSchema = z.object({
  actionID: z.string(),
});

type Data = 'Success';

type ErrorCode = never;

export async function itemBidding(id: number, payload: z.input<typeof ReqSchema>) {
  const data = throwIfInvalid(payload, ReqSchema);

  const formData = new FormData();
  formData.append('auctionID', data.actionID);

  const res = await withAuth(apiClient)<Data, ErrorCode>(`/items/${id}/bidding`, {
    method: 'POST',
    body: formData,
  });

  revalidateTag('items');

  return res;
}
