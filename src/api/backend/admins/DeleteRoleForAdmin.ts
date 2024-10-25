'use server';

import { revalidateTag } from 'next/cache';
import { apiClientWithToken } from '@/api/core/apiClientWithToken';
import { createApiErrorServerSide } from '@/api/core/ApiError/createApiErrorServerSide';
import { throwIfInvalid, type SuccessResponseJson } from '@/api/core/static';
import { appendEntries } from '@/domain/crud/appendEntries';
import { z } from 'zod';

const ReqSchema = z.object({
  role: z.string().array(),
});

type Data = 'Success';

export async function DeleteRoleForAdmin(account: string, payload: z.input<typeof ReqSchema>) {
  throwIfInvalid(payload, ReqSchema);

  const query = new URLSearchParams();
  appendEntries(query, payload);

  const res = await apiClientWithToken
    .delete<SuccessResponseJson<Data>>(`backend/admins/account/${account}/roles?${query.toString()}`, {})
    .json()
    .catch(createApiErrorServerSide);

  revalidateTag('admins');

  return res;
}
