'use server';

import * as endpoint from '@/api/backend/reports/RecordPaymentReview';
import { createActionApi } from '@/server/next/createActionApi';
import { createApiErrorServerSide } from '@/server/next/createApiErrorServerSide';
import { revalidateMutation } from '@/server/next/revalidateMutation';

export async function RecordPaymentReview(
  id: Parameters<typeof endpoint.RecordPaymentReview>[1],
  payload: Parameters<typeof endpoint.RecordPaymentReview>[2]
) {
  const res = await endpoint.RecordPaymentReview(createActionApi(), id, payload).catch(createApiErrorServerSide);
  if (!res.error) revalidateMutation('RecordPaymentReview');
  return res;
}
