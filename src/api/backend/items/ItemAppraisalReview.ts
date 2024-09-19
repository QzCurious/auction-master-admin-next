'use server';

import { revalidateTag } from 'next/cache';
import { throwIfInvalid } from '@/api/helpers/throwIfInvalid';
import { appendEntries } from '@/static';
import { z } from 'zod';

import { apiClient } from '../../apiClient';
import { withAuth } from '../../withAuth';

const ReqSchema = z.object({
  action: z.enum(['approve', 'reject']),
});

type Data = 'Success';

type ErrorCode =
  // item type not set
  '1023';

export async function ItemAppraisalReview(id: number, payload: z.input<typeof ReqSchema>) {
  const data = throwIfInvalid(payload, ReqSchema);

  const urlencoded = new URLSearchParams();
  appendEntries(urlencoded, data);

  const res = await withAuth(apiClient)<Data, ErrorCode>(`/items/${id}/review`, {
    method: 'POST',
    body: urlencoded,
  });

  revalidateTag('items');

  return res;
}
