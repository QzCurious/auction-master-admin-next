import { type SuccessResponseJson } from '@/api/core/static';
import { type Worker } from '@/api/endpoints/workers/GetWorkers';
import { type KyInstance } from 'ky';

type Data = 'Success';

export async function DeleteWorker(api: KyInstance, id: Worker['id']) {
  const res = await api.delete<SuccessResponseJson<Data>>(`backend/workers/${id}`).json();
  return res;
}
