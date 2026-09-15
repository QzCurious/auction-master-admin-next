'use server';

import * as endpoint from '@/api/backend/items/ItemAppraisalReview';
import { createActionApi } from '@/server/next/createActionApi';
import { createApiErrorServerSide } from '@/server/next/createApiErrorServerSide';
import { revalidateMutation } from '@/server/next/revalidateMutation';

export async function ItemAppraisalReview(
  id: Parameters<typeof endpoint.ItemAppraisalReview>[1],
  payload: Parameters<typeof endpoint.ItemAppraisalReview>[2]
) {
  const res = await endpoint.ItemAppraisalReview(createActionApi(), id, payload).catch(createApiErrorServerSide);
  if (!res.error) revalidateMutation('ItemAppraisalReview');
  return res;
}
