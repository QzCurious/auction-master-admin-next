'use server';

import { revalidateTag } from 'next/cache';
import { apiClientWithToken } from '@/api/core/apiClientWithToken';
import { createApiErrorServerSide } from '@/api/core/ApiError/createApiErrorServerSide';
import { type SuccessResponseJson } from '@/api/core/static';

type Data = 'Success';

export async function ItemWarehousePersonnelConfirmed(id: number) {
  const res = await apiClientWithToken
    .post<SuccessResponseJson<Data>>(`backend/items/${id}/warehouse-personnel-confirmed`)
    .json()
    .catch(createApiErrorServerSide);

  revalidateTag('items');

  return res;
}
