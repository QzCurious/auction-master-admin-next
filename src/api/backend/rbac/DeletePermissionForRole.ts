'use server';

import { revalidateTag } from 'next/cache';
import { apiClientWithToken } from '@/api/core/apiClientWithToken';
import { createApiErrorServerSide } from '@/api/core/ApiError/createApiErrorServerSide';
import { throwIfInvalid, type SuccessResponseJson } from '@/api/core/static';
import { appendEntries } from '@/domain/crud/appendEntries';
import { z } from 'zod';

const ReqSchema = z.object({
  role: z.string(),
  permissions: z
    .object({
      key: z.string(),
      fields: z.string().array(),
    })
    .array(),
});

type Data = 'Success';

export async function DeletePermissionForRole(payload: z.input<typeof ReqSchema>) {
  const data = throwIfInvalid(payload, ReqSchema);

  const permissions = data.permissions.flatMap((p) => p.fields.map((f) => `${p.key}:${f}`));

  const query = new URLSearchParams();
  appendEntries(query, { role: data.role, permissionKey: permissions });

  const res = await apiClientWithToken
    .delete<SuccessResponseJson<Data>>(`/backend/permissions?${query.toString()}`)
    .json()
    .catch(createApiErrorServerSide);

  revalidateTag('roles');

  return res;
}
