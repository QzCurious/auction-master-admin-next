'use server';

import { revalidateTag } from 'next/cache';
import { apiClientWithToken } from '@/api/core/apiClientWithToken';
import { createApiErrorServerSide } from '@/api/core/ApiError/createApiErrorServerSide';
import { type SuccessResponseJson } from '@/api/core/static';

type Data = 'Success';

export async function HandleConsignorVerification(id: number, action: 'approve' | 'reject') {
  if (action === 'approve') {
    const res = await apiClientWithToken
      .post<SuccessResponseJson<Data>>(`backend/consignors/verifications/${id}/${action}`, {})
      .json()
      .catch(createApiErrorServerSide);

    revalidateTag('consignorVerifications');
    return res;
  }

  const res = await apiClientWithToken
    .post<SuccessResponseJson<Data>>(`backend/consignors/verifications/${id}/${action}`)
    .json()
    .catch(createApiErrorServerSide);

  revalidateTag('consignorVerifications');
  return res;
}
