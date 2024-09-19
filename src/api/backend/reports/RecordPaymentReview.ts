'use server';

import { revalidateTag } from 'next/cache';
import { throwIfInvalid } from '@/api/helpers/throwIfInvalid';
import { appendEntries } from '@/static';
import { z } from 'zod';

import { apiClient } from '../../apiClient';
import { withAuth } from '../../withAuth';
import { type Record } from './GetRecords';

const ReqSchema = z.object({
  action: z.enum(['approve', 'reject']),
});

type Data = 'Success';

type ErrorCode = never;

export async function RecordPaymentReview(id: Record['id'], payload: z.input<typeof ReqSchema>) {
  const data = throwIfInvalid(payload, ReqSchema);

  const urlencoded = new URLSearchParams();
  appendEntries(urlencoded, data);

  const res = await withAuth(apiClient)<Data, ErrorCode>(`/reports/records/${id}/review`, {
    method: 'POST',
    body: urlencoded,
  });

  revalidateTag('records');

  return res;
}
