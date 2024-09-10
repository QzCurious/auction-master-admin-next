'use server';

import { revalidateTag } from 'next/cache';
import { apiClient } from '@/api/apiClient';
import { throwIfInvalid } from '@/api/helpers/throwIfInvalid';
import { withAuth } from '@/api/withAuth';
import { appendEntries } from '@/static';
import { z } from 'zod';

const ReqSchema = z.object({
  role: z.string(),
  permissionKey: z.string().array(),
});

type Data = 'Success';

type ErrorCode = never;

export async function DeletePermissionForRole(payload: z.input<typeof ReqSchema>) {
  const data = throwIfInvalid(payload, ReqSchema);

  const query = new URLSearchParams();
  appendEntries(query, data);

  const res = await withAuth(apiClient)<Data, ErrorCode>(`/permissions?${query.toString()}`, {
    method: 'DELETE',
  });

  revalidateTag('roles');

  return res;
}
