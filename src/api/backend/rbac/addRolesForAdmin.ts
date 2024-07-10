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

export async function addRolesForAdmin(account: string, payload: z.input<typeof ReqSchema>) {
  throwIfInvalid(payload, ReqSchema);

  const formData = new FormData();
  for (const role of payload.roles) {
    formData.append('role', role);
  }

  const res = await withAuth(apiClient)<Data, ErrorCode>(`/admins/account/${account}/roles`, {
    method: 'POST',
    body: formData,
  });

  revalidateTag('admins');

  return res;
}
