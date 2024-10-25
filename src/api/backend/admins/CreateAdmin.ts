'use server';

import { revalidateTag } from 'next/cache';
import { apiClientWithToken } from '@/api/core/apiClientWithToken';
import { createApiErrorServerSide } from '@/api/core/ApiError/createApiErrorServerSide';
import { throwIfInvalid, type SuccessResponseJson } from '@/api/core/static';
import { appendEntries } from '@/domain/crud/appendEntries';
import { z } from 'zod';

const ReqSchema = z.object({
  account: z.string(),
  password: z.string(),
  status: z.number(),
});

type Data = 'Success';

export async function CreateAdmin(payload: z.input<typeof ReqSchema>) {
  throwIfInvalid(payload, ReqSchema);

  const urlencoded = new URLSearchParams();
  appendEntries(urlencoded, payload);

  const res = await apiClientWithToken
    .post<SuccessResponseJson<Data>>('backend/admins', {
      body: urlencoded,
    })
    .json()
    .catch(createApiErrorServerSide);

  revalidateTag('admins');

  return res;
}
