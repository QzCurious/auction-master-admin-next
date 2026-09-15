import { type Worker } from '@/api/backend/workers/GetWorkers';
import { type SuccessResponseJson } from '@/api/core/static';
import { type KyInstance } from 'ky';

type Data = 'Success';

export async function SetWorkerCookie(api: KyInstance, id: Worker['id'], cookiesJsonString: string) {
  const res = await api
    .post<SuccessResponseJson<Data>>(`backend/workers/${id}/cookie`, {
      body: cookiesJsonString,
      headers: {
        'Content-Type': 'application/json',
      },
    })
    .json();
  return res;
}
