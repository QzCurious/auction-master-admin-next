'use server';

import { revalidateTag } from 'next/cache';

import { apiClient, type ApiClientResponse } from '../../apiClient';
import { withAuth } from '../../withAuth';

type Data = 'Success';

type RejectErrorCode = never;

type ApproveErrorCode =
  // name incorrect
  | '1005'
  // identification incorrect
  | '1006'
  // consignor verification not exist
  | '1604';

export async function HandleConsignorVerification(
  id: number,
  action: 'reject'
): Promise<ApiClientResponse<'Success', '1001' | '1003' | RejectErrorCode>>;
export async function HandleConsignorVerification(
  id: number,
  action: 'approve'
): Promise<ApiClientResponse<'Success', '1001' | '1003' | ApproveErrorCode>>;
export async function HandleConsignorVerification(id: number, action: 'approve' | 'reject') {
  if (action === 'approve') {
    const res = await withAuth(apiClient)<Data, ApproveErrorCode>(`/consignors/verifications/${id}/${action}`, {
      method: 'POST',
    });

    revalidateTag('consignorVerifications');
    return res;
  }

  const res = await withAuth(apiClient)<Data, RejectErrorCode>(`/consignors/verifications/${id}/${action}`, {
    method: 'POST',
  });

  revalidateTag('consignorVerifications');
  return res;
}
