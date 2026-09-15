'use server';

import { revalidateTag } from 'next/cache';
import { createApiErrorServerSide } from '@/api/core/ApiError/createApiErrorServerSide';
import * as endpoint from '@/api/endpoints/reports/RecordPaymentReview';
import { createActionApi } from '@/server/next/createActionApi';

export async function RecordPaymentReview(
  id: Parameters<typeof endpoint.RecordPaymentReview>[1],
  payload: Parameters<typeof endpoint.RecordPaymentReview>[2]
) {
  const res = await endpoint.RecordPaymentReview(createActionApi(), id, payload).catch(createApiErrorServerSide);
  revalidateTag('records');
  return res;
}
