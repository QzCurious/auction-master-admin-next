'use server';

import { revalidateTag } from 'next/cache';
import { throwIfInvalid } from '@/api/helpers/throwIfInvalid';
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

  const formData = new FormData();
  formData.append('action', data.action);

  const res = await withAuth(apiClient)<Data, ErrorCode>(`/items/${id}/review`, {
    method: 'POST',
    body: formData,
  });

  revalidateTag('items');

  return res;
}
