'use server';

import { revalidateTag } from 'next/cache';
import { apiClient } from '@/api/apiClient';
import { throwIfInvalid } from '@/api/helpers/throwIfInvalid';
import { withAuth } from '@/api/withAuth';
import { appendEntries } from '@/domain/crud/appendEntries';
import { z } from 'zod';

const ReqSchema = z.object({
  account: z.string(),
  password: z.string(),
  status: z.number(),
});

type Data = 'Success';

type ErrorCode =
  // create admin error
  '1501';

export async function CreateAdmin(payload: z.input<typeof ReqSchema>) {
  throwIfInvalid(payload, ReqSchema);

  const urlencoded = new URLSearchParams();
  appendEntries(urlencoded, payload);

  const res = await withAuth(apiClient)<Data, ErrorCode>('/backend/admins', {
    method: 'POST',
    body: urlencoded,
  });

  revalidateTag('admins');

  return res;
}
