'use server';

import { revalidateTag } from 'next/cache';
import { apiClient } from '@/api/apiClient';
import { throwIfInvalid } from '@/api/helpers/throwIfInvalid';
import { withAuth } from '@/api/withAuth';
import { z } from 'zod';

import { WORKER_STATUS_DATA } from '../configs.data';

const ReqSchema = z.object({
  status: z.coerce.number().refine((v) => WORKER_STATUS_DATA.some((item) => item.value === v)),
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
