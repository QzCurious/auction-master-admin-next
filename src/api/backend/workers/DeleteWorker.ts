'use server';

import { revalidateTag } from 'next/cache';
import { apiClientWithToken } from '@/api/core/apiClientWithToken';
import { createApiErrorServerSide } from '@/api/core/ApiError/createApiErrorServerSide';
import { type SuccessResponseJson } from '@/api/core/static';

import { type Worker } from './GetWorkers';

type Data = 'Success';

export async function DeleteWorker(id: Worker['id']) {
  const res = await apiClientWithToken
    .delete<SuccessResponseJson<Data>>(`backend/workers/${id}`)
    .json()
    .catch(createApiErrorServerSide);

  revalidateTag('workers');

  return res;
}
