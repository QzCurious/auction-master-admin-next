'use server';

import { revalidateTag } from 'next/cache';
import { apiClientWithToken } from '@/api/core/apiClientWithToken';
import { createApiErrorServerSide } from '@/api/core/ApiError/createApiErrorServerSide';
import { throwIfInvalid, type SuccessResponseJson } from '@/api/core/static';
import { z } from 'zod';

const ReqSchema = z.object({
  role: z.string().transform((r) => [r]),
  permissions: z
    .object({
      key: z.string(),
      fields: z.string().array(),
    })
    .array(),
});

type Data = 'Success';

export async function AddPermissionForRole(payload: z.input<typeof ReqSchema>) {
  const data = throwIfInvalid(payload, ReqSchema);

  const res = await apiClientWithToken
    .post<SuccessResponseJson<Data>>('backend/permissions', {
      json: data,
    })
    .json()
    .catch(createApiErrorServerSide);

  revalidateTag('roles');

  return res;
}
