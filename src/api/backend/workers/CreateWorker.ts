'use server';

import { revalidateTag } from 'next/cache';
import { apiClient } from '@/api/apiClient';
import { throwIfInvalid } from '@/api/helpers/throwIfInvalid';
import { withAuth } from '@/api/withAuth';
import { appendEntries } from '@/static';
import { z } from 'zod';

const ReqSchema = z.object({
  type: z.string(),
  url: z.string(),
});

type Data = 'Success';

type ErrorCode = never;

export async function CreateWorker(payload: z.input<typeof ReqSchema>) {
  const data = throwIfInvalid(payload, ReqSchema);

  const urlencoded = new URLSearchParams();
  appendEntries(urlencoded, data);

  const res = await withAuth(apiClient)<Data, ErrorCode>('/workers', {
    method: 'POST',
    body: urlencoded,
  });

  revalidateTag('workers');

  return res;
}
