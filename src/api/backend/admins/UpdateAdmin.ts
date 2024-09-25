'use server';

import { revalidateTag } from 'next/cache';
import { apiClient } from '@/api/apiClient';
import { throwIfInvalid } from '@/api/helpers/throwIfInvalid';
import { withAuth } from '@/api/withAuth';
import { appendEntries } from '@/domain/crud/appendEntries';
import { z } from 'zod';

const ReqSchema = z
  .object({
    password: z
      .string()
      .optional()
      .transform((val) => val || undefined),
    status: z.number(),
  })
  .partial();

type Data = 'Success';

type ErrorCode = never;

export async function UpdateAdmin(id: number, payload: z.input<typeof ReqSchema>) {
  const data = throwIfInvalid(payload, ReqSchema);

  const urlencoded = new URLSearchParams();
  appendEntries(urlencoded, data);

  const res = await withAuth(apiClient)<Data, ErrorCode>(`/backend/admins/${id}`, {
    method: 'PATCH',
    body: urlencoded,
  });

  revalidateTag('admins');

  return res;
}
