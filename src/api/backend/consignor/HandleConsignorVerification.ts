'use server';

import { revalidateTag } from 'next/cache';
import { throwIfInvalid } from '@/api/helpers/throwIfInvalid';
import { z } from 'zod';

import { apiClient, type ApiClientResponse } from '../../apiClient';
import { withAuth } from '../../withAuth';

const ReqSchema = z.object({
  name: z.string().min(1),
  identification: z.string().min(1),
});

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
  action: 'approve',
  payload: z.input<typeof ReqSchema>
): Promise<ApiClientResponse<'Success', '1001' | '1003' | ApproveErrorCode>>;
export async function HandleConsignorVerification(
  id: number,
  action: 'approve' | 'reject',
  payload?: z.input<typeof ReqSchema>
) {
  if (action === 'approve') {
    if (!payload) throw new Error('Bug');
    const data = throwIfInvalid(payload, ReqSchema);

    const formData = new FormData();
    data.name && formData.append('name', data.name);
    data.identification && formData.append('identification', data.identification);

    const res = await withAuth(apiClient)<Data, ApproveErrorCode>(`/consignors/verifications/${id}/${action}`, {
      method: 'POST',
      body: formData,
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
