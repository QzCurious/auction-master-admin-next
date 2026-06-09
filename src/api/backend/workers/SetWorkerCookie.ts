'use server';

import { revalidateTag } from 'next/cache';
import { apiClientWithToken } from '@/api/core/apiClientWithToken';
import { createApiErrorServerSide } from '@/api/core/ApiError/createApiErrorServerSide';
import { type SuccessResponseJson } from '@/api/core/static';

import { type Worker } from './GetWorkers';

type Data = 'Success';

export async function SetWorkerCookie(id: Worker['id'], cookiesJsonString: string) {
  const res = await apiClientWithToken
    .post<SuccessResponseJson<Data>>(`backend/workers/${id}/cookie`, {
      body: cookiesJsonString,
      headers: {
        'Content-Type': 'application/json',
      },
    })
    .json()
    .catch(createApiErrorServerSide);

  revalidateTag('workers');

  return res;
}
