'use server';

import { revalidateTag } from 'next/cache';
import { apiClientWithToken } from '@/api/core/apiClientWithToken';
import { createApiErrorServerSide } from '@/api/core/ApiError/createApiErrorServerSide';
import { type SuccessResponseJson } from '@/api/core/static';

type Data = 'Success';

export async function DeleteAdmin(id: number) {
  const res = await apiClientWithToken
    .delete<SuccessResponseJson<Data>>(`backend/admins/${id}`, {})
    .json()
    .catch(createApiErrorServerSide);

  revalidateTag('admins');

  return res;
}
