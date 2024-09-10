'use server';

import { apiClient } from '@/api/apiClient';
import { throwIfInvalid } from '@/api/helpers/throwIfInvalid';
import { withAuth } from '@/api/withAuth';
import { appendEntries } from '@/static';
import { z } from 'zod';

const ReqSchema = z.object({
  oldPassword: z.string().min(1),
  password: z.string().min(1),
});

type Data = 'Success';

type ErrorCode =
  // password cannot be same as old password
  | '11'
  // old password incorrect
  | '1004';

export async function UpdateAdminPassword(id: number, payload: z.input<typeof ReqSchema>) {
  const data = throwIfInvalid(payload, ReqSchema);

  const formData = new FormData();
  appendEntries(formData, data);

  const res = await withAuth(apiClient)<Data, ErrorCode>(`/admins/${id}/password`, {
    method: 'PATCH',
    body: formData,
  });

  return res;
}
