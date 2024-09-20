'use server';

import { revalidateTag } from 'next/cache';
import { apiClient } from '@/api/apiClient';
import { throwIfInvalid } from '@/api/helpers/throwIfInvalid';
import { withAuth } from '@/api/withAuth';
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

type ErrorCode = never;

export async function DeletePermissionForRole(payload: z.input<typeof ReqSchema>) {
  const data = throwIfInvalid(payload, ReqSchema);

  const permissions = data.permissions.flatMap((p) => p.fields.map((f) => `${p.key}:${f}`));

  const query = new URLSearchParams();
  appendEntries(query, { role: data.role, permissionKey: permissions });

  const res = await withAuth(apiClient)<Data, ErrorCode>(`/permissions?${query.toString()}`, {
    method: 'DELETE',
  });

  revalidateTag('roles');

  return res;
}
