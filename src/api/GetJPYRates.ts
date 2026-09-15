'use server';

import { createApiErrorServerSide } from '@/api/core/ApiError/createApiErrorServerSide';
import * as endpoint from '@/api/endpoints/GetJPYRates';
import { createActionApi } from '@/server/next/createActionApi';

export async function GetJPYRates() {
  const res = await endpoint
    .GetJPYRates(createActionApi().extend({ next: { tags: ['jpy-rates'] } }))
    .catch(createApiErrorServerSide);

  return res;
}
