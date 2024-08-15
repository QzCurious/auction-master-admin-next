'use server';

import { revalidateTag } from 'next/cache';
import { apiClient } from '@/api/apiClient';
import { withAuth } from '@/api/withAuth';

import { type Worker } from './GetWorkers';

type Data = 'Success';

type ErrorCode =
  // set yahoo jp cookie error
  '1401';

export async function SetWorkerCookie(id: Worker['id'], cookiesJsonString: string) {
  const res = await withAuth(apiClient)<Data, ErrorCode>(`/workers/${id}/cookie`, {
    method: 'POST',
    body: cookiesJsonString,
    headers: {
      'Content-Type': 'application/json',
    },
  });

  revalidateTag('workers');

  return res;
}
