'use server';

import { revalidateTag } from 'next/cache';
import { apiClient } from '@/api/apiClient';
import { throwIfInvalid } from '@/api/helpers/throwIfInvalid';
import { withAuth } from '@/api/withAuth';
import * as R from 'remeda';
import { z } from 'zod';

import { WORKER_STATUS } from '../configs.data';

const ReqSchema = z.object({
  status: z.coerce.number().refine(R.isIncludedIn(WORKER_STATUS.data.map((item) => item.value))),
});

type Data = 'Success';

type ErrorCode = never;

export async function ToggleActivateWorker(id: number, payload: z.input<typeof ReqSchema>) {
  const data = throwIfInvalid(payload, ReqSchema);

  const res = await withAuth(apiClient)<Data, ErrorCode>(`/workers/${id}/${data.status}`, {
    method: 'PATCH',
  });

  revalidateTag('workers');

  return res;
}
