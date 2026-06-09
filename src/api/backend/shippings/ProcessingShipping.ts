'use server';

import { revalidateTag } from 'next/cache';
import { apiClientWithToken } from '@/api/core/apiClientWithToken';
import { createApiErrorServerSide } from '@/api/core/ApiError/createApiErrorServerSide';
import { type SuccessResponseJson } from '@/api/core/static';

import { type Shipping } from './GetShippings';

type Data = 'Success';

export async function ProcessingShipping(id: Shipping['id']) {
  const res = await apiClientWithToken
    .post<SuccessResponseJson<Data>>(`backend/shippings/${id}/processing`)
    .json()
    .catch(createApiErrorServerSide);

  revalidateTag('shippings');

  return res;
}
