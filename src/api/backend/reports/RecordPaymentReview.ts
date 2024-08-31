'use server';

import { revalidateTag } from 'next/cache';

import { apiClient } from '../../apiClient';
import { withAuth } from '../../withAuth';
import { type Record } from './GetRecords';
import { z } from 'zod';
import { throwIfInvalid } from '@/api/helpers/throwIfInvalid';

const ReqSchema = z.object({
  action: z.enum(['approve', 'reject']),
});

type Data = 'Success';

type ErrorCode = never;

export async function RecordPaymentReview(id: Record['id'], payload: z.input<typeof ReqSchema>) {
  const data = throwIfInvalid(payload, ReqSchema);

  const formData = new FormData();
  formData.append('action', data.action);

  const res = await withAuth(apiClient)<Data, ErrorCode>(`/reports/records/${id}/review`, {
    method: 'POST',
    body: formData,
  });

  revalidateTag('records');

  return res;
}
