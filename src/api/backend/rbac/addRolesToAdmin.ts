'use server'

import { apiClient } from '@/api/apiClient';
import { throwIfInvalid } from '@/api/helpers/throwIfInvalid';
import { withAuth } from '@/api/withAuth';
import { z } from 'zod';

const ReqSchema = z.object({
  roles: z.string().array(),
});

type Data = 'Success';

type ErrorCode = never;

export async function addRolesToAdmin(account: string, payload: z.input<typeof ReqSchema>) {
  throwIfInvalid(payload, ReqSchema);

  const formData = new FormData();
  for (const role of payload.roles) {
    formData.append('role', role);
  }

  const res = await withAuth(apiClient)<Data, ErrorCode>(`/roles/account/${account}`, {
    method: 'POST',
    body: formData,
  });

  return res;
}
