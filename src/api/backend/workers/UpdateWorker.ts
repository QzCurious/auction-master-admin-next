'use server';

import { revalidateTag } from 'next/cache';
import { apiClient } from '@/api/apiClient';
import { throwIfInvalid } from '@/api/helpers/throwIfInvalid';
import { withAuth } from '@/api/withAuth';
import { appendEntries } from '@/domain/crud/appendEntries';
import { z } from 'zod';

const ReqSchema = z
  .object({
    type: z.string(),
    url: z.string(),
    account: z.string(),
    name: z.string(),
    phone: z.string(),
    postalCode: z.string(),
    birthday: z.coerce.date(),
    email: z.literal('').or(z.string().email()),
    simCardNumber: z.string(),
    activationAt: z.coerce.date(),
    remark: z.string(),
    status: z.coerce.number(),
  })
  .partial();

type Data = 'Success';

type ErrorCode = never;

export async function UpdateWorker(id: number, payload: z.input<typeof ReqSchema>) {
  const data = throwIfInvalid(payload, ReqSchema);

  const urlencoded = new URLSearchParams();
  appendEntries(urlencoded, data);

  const res = await withAuth(apiClient)<Data, ErrorCode>(`/backend/workers/${id}`, {
    method: 'PATCH',
    body: urlencoded,
  });

  revalidateTag('workers');

  return res;
}
