'use server';

import { apiClient } from '@/api/apiClient';
import { throwIfInvalid } from '@/api/helpers/throwIfInvalid';
import { handleAuth } from '@/api/withAuth';
import { z } from 'zod';

const ReqSchema = z.object({
  roles: z.string().array(),
});

type Data = 'Success';

type ErrorCode = never;

export async function removeRolesFromAdmin(account: string, payload: z.input<typeof ReqSchema>) {
  throwIfInvalid(payload, ReqSchema);

  const query = new URLSearchParams();
  for (const role of payload.roles) {
    query.append('role', role);
  }

  const res = await handleAuth(apiClient)<Data, ErrorCode>(`/roles/account/${account}?${query.toString()}`, {
    method: 'DELETE',
  });

  return res;
}
