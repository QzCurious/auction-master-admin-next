'use server';

import { revalidateTag } from 'next/cache';
import { apiClient } from '@/api/apiClient';
import { throwIfInvalid } from '@/api/helpers/throwIfInvalid';
import { withAuth } from '@/api/withAuth';
import { appendEntries } from '@/static';
import { z } from 'zod';

const ReqSchema = z.object({
  role: z.string(),
  description: z.string(),
});

type Data = 'Success';

type ErrorCode =
  // duplicate Role
  '1000';

export async function CreateRole(payload: z.input<typeof ReqSchema>) {
  const data = throwIfInvalid(payload, ReqSchema);

  const urlencoded = new URLSearchParams();
  appendEntries(urlencoded, data);

  const res = await withAuth(apiClient)<Data, ErrorCode>('/roles', {
    method: 'POST',
    body: urlencoded,
  });

  revalidateTag('roles');

  return res;
}
