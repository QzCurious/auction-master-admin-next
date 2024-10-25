'use server';

import { revalidateTag } from 'next/cache';
import { apiClientWithToken } from '@/api/core/apiClientWithToken';
import { createApiErrorServerSide } from '@/api/core/ApiError/createApiErrorServerSide';
import { throwIfInvalid, type SuccessResponseJson } from '@/api/core/static';
import { appendEntries } from '@/domain/crud/appendEntries';
import { z } from 'zod';

const ReqSchema = z
  .object({
    password: z
      .string()
      .optional()
      .transform((val) => val || undefined),
    status: z.number(),
  })
  .partial();

type Data = 'Success';

export async function UpdateAdmin(id: number, payload: z.input<typeof ReqSchema>) {
  const data = throwIfInvalid(payload, ReqSchema);

  const urlencoded = new URLSearchParams();
  appendEntries(urlencoded, data);

  const res = await apiClientWithToken
    .patch<SuccessResponseJson<Data>>(`backend/admins/${id}`, {
      body: urlencoded,
    })
    .json()
    .catch(createApiErrorServerSide);

  revalidateTag('admins');

  return res;
}
