'use server';

import { revalidateTag } from 'next/cache';
import { apiClientWithToken } from '@/api/core/apiClientWithToken';
import { createApiErrorServerSide } from '@/api/core/ApiError/createApiErrorServerSide';
import { throwIfInvalid, type SuccessResponseJson } from '@/api/core/static';
import { appendEntries } from '@/domain/crud/appendEntries';
import { z } from 'zod';

import { type Shipping } from './GetShippings';

const ReqSchema = z
  .object({
    shippingCostsWithinJapan: z.number(),
  })
  .partial();

type Data = 'Success';

export async function ShippingClosed(id: Shipping['id'], payload: z.input<typeof ReqSchema>) {
  const data = throwIfInvalid(payload, ReqSchema);

  const urlencoded = new URLSearchParams();
  appendEntries(urlencoded, data);

  const res = await apiClientWithToken
    .post<SuccessResponseJson<Data>>(`backend/shippings/${id}/closed`, {
      body: urlencoded,
    })
    .json()
    .catch(createApiErrorServerSide);

  revalidateTag('shippings');

  return res;
}
