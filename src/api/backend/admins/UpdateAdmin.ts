'use server';

import { revalidateTag } from 'next/cache';
import { apiClient } from '@/api/apiClient';
import { throwIfInvalid } from '@/api/helpers/throwIfInvalid';
import { withAuth } from '@/api/withAuth';
import { z } from 'zod';

const ReqSchema = z.object({
  password: z
    .string()
    .optional()
    .transform((val) => val || undefined),
  status: z.number(),
});

type Data = 'Success';

type ErrorCode = never;

export async function UpdateAdmin(id: number, payload: z.input<typeof ReqSchema>) {
  throwIfInvalid(payload, ReqSchema);

  const formData = new FormData();
  payload.password && formData.append('password', payload.password);
  payload.status && formData.append('status', payload.status.toString());

  const res = await withAuth(apiClient)<Data, ErrorCode>(`/admins/${id}`, {
    method: 'PATCH',
    body: formData,
  });

  revalidateTag('admins');

  return res;
}
