'use server';

import { apiClientWithToken } from './core/apiClientWithToken';
import { createApiErrorServerSide } from './core/ApiError/createApiErrorServerSide';
import { SuccessResponseJson } from './core/static';

interface Data {
  buying: number;
  selling: number;
}

export async function GetJPYRates() {
  const res = await apiClientWithToken
    .get<SuccessResponseJson<Data>>('/backend/jpy-rates', {
      next: { tags: ['jpy-rates'] },
    })
    .json()
    .catch(createApiErrorServerSide);

  return res;
}
