'use server';

import { revalidateTag } from 'next/cache';
import { apiClientWithToken } from '@/api/core/apiClientWithToken';
import { createApiErrorServerSide } from '@/api/core/ApiError/createApiErrorServerSide';
import { throwIfInvalid, type SuccessResponseJson } from '@/api/core/static';
import { appendEntries } from '@/domain/crud/appendEntries';
import { z } from 'zod';

const ReqSchema = z
  .object({
    type: z.string(),
    url: z.string(),
    account: z.string(),
    name: z.string(),
    phone: z.string(),
    postalCode: z.string(),
    birthday: z.coerce.date(),
    email: z.literal('').or(z.string().email()),
    simCardNumber: z.string(),
    activationAt: z.coerce.date(),
    remark: z.string(),
    status: z.coerce.number(),
  })
  .partial();

type Data = 'Success';

export async function UpdateWorker(id: number, payload: z.input<typeof ReqSchema>) {
  const data = throwIfInvalid(payload, ReqSchema);

  const urlencoded = new URLSearchParams();
  appendEntries(urlencoded, data);

  const res = await apiClientWithToken
    .patch<SuccessResponseJson<Data>>(`backend/workers/${id}`, {
      body: urlencoded,
    })
    .json()
    .catch(createApiErrorServerSide);

  revalidateTag('workers');

  return res;
}
