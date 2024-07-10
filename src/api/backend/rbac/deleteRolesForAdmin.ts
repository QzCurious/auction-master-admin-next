'use server';

import { revalidateTag } from 'next/cache';
import { apiClient } from '@/api/apiClient';
import { throwIfInvalid } from '@/api/helpers/throwIfInvalid';
import { withAuth } from '@/api/withAuth';
import { z } from 'zod';

const ReqSchema = z.object({
  roles: z.string().array(),
});

type Data = 'Success';

type ErrorCode = never;

export async function deleteRolesForAdmin(account: string, payload: z.input<typeof ReqSchema>) {
  throwIfInvalid(payload, ReqSchema);

  const query = new URLSearchParams();
  for (const role of payload.roles) {
    query.append('role', role);
  }

  const res = await withAuth(apiClient)<Data, ErrorCode>(`/admins/account/${account}/roles?${query.toString()}`, {
    method: 'DELETE',
  });

  revalidateTag('admins');

  return res;
}
