'use server';

import * as endpoint from '@/api/GetJPYRates';
import { createActionApi } from '@/server/next/createActionApi';
import { createApiErrorServerSide } from '@/server/next/createApiErrorServerSide';

export async function GetJPYRates() {
  const res = await endpoint
    .GetJPYRates(createActionApi().extend({ next: { tags: ['jpy-rates'] } }))
    .catch(createApiErrorServerSide);

  return res;
}
