'use server';

import { revalidateTag } from 'next/cache';
import { apiClient } from '@/api/apiClient';
import { throwIfInvalid } from '@/api/helpers/throwIfInvalid';
import { withAuth } from '@/api/withAuth';
import { appendEntries } from '@/domain/crud/appendEntries';
import { z } from 'zod';

const ReqSchema = z.object({
  role: z.string().array(),
});

type Data = 'Success';

type ErrorCode = never;

export async function DeleteRoleForAdmin(account: string, payload: z.input<typeof ReqSchema>) {
  throwIfInvalid(payload, ReqSchema);

  const query = new URLSearchParams();
  appendEntries(query, payload);

  const res = await withAuth(apiClient)<Data, ErrorCode>(
    `/backend/admins/account/${account}/roles?${query.toString()}`,
    {
      method: 'DELETE',
    }
  );

  revalidateTag('admins');

  return res;
}
