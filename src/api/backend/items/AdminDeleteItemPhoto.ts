'use server';

import { revalidateTag } from 'next/cache';
import { apiClientWithToken } from '@/api/core/apiClientWithToken';
import { createApiErrorServerSide } from '@/api/core/ApiError/createApiErrorServerSide';
import { type SuccessResponseJson } from '@/api/core/static';

type Data = 'Success';

export async function AdminDeleteItemPhoto(id: number, sorted: number) {
  const res = await apiClientWithToken
    .delete<SuccessResponseJson<Data>>(`backend/items/${id}/photos/${sorted}`)
    .json()
    .catch(createApiErrorServerSide);

  revalidateTag('items');

  return res;
}
