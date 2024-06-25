'use server';

import { revalidateTag } from 'next/cache';

import { apiClient } from '../../apiClient';
import { withAuth } from '../../withAuth';

export type Data = 'Success';

export type ErrorCode = never

export async function rejectConsignorVerification(id: number) {
  const res = await withAuth(apiClient)<Data, ErrorCode>(`/consignors/verifications/${id}/reject`, {
    method: 'POST',
  });

  revalidateTag('consignorVerifications');

  return res;
}
