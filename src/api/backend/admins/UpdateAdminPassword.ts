'use server';

import { apiClient } from '@/api/apiClient';
import { throwIfInvalid } from '@/api/helpers/throwIfInvalid';
import { withAuth } from '@/api/withAuth';
import { z } from 'zod';

const ReqSchema = z.object({
  oldPassword: z.string().min(1),
  password: z.string().min(1),
});

type Data = 'Success';

// 11: password cannot be same as old password
// 1004: old password incorrect
type ErrorCode = '11' | '1004';

export async function UpdateAdminPassword(id: number, payload: z.input<typeof ReqSchema>) {
  const data = throwIfInvalid(payload, ReqSchema);

  const formData = new FormData();
  data.oldPassword && formData.append('oldPassword', data.oldPassword);
  data.password && formData.append('password', data.password);

  const res = await withAuth(apiClient)<Data, ErrorCode>(`/admins/${id}/password`, {
    method: 'PATCH',
    body: formData,
  });

  return res;
}
