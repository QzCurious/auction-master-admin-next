'use server';

import { revalidateTag } from 'next/cache';
import { apiClientWithToken } from '@/api/core/apiClientWithToken';
import { createApiErrorServerSide } from '@/api/core/ApiError/createApiErrorServerSide';
import { throwIfInvalid, type SuccessResponseJson } from '@/api/core/static';
import { WORKER_STATUS } from '@/domain/static/static-config-mappers';
import * as R from 'remeda';
import { z } from 'zod';

const ReqSchema = z.object({
  status: z.coerce.number().refine(R.isIncludedIn(WORKER_STATUS.data.map((item) => item.value))),
});

type Data = 'Success';

export async function ToggleActivateWorker(id: number, payload: z.input<typeof ReqSchema>) {
  const data = throwIfInvalid(payload, ReqSchema);

  const res = await apiClientWithToken
    .patch<SuccessResponseJson<Data>>(`backend/workers/${id}/${data.status}`)
    .json()
    .catch(createApiErrorServerSide);

  revalidateTag('workers');

  return res;
}
