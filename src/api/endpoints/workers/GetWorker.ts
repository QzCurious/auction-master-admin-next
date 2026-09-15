import { type SuccessResponseJson } from '@/api/core/static';
import { type KyInstance } from 'ky';
import { z } from 'zod';

const ReqSchema = z.object({
  limit: z.coerce.number().default(10),
  offset: z.coerce.number().default(0),
});

export interface Worker {
  id: number;
  type: string;
  url: string;
  account: string;
  name: string;
  phone: string;
  postalCode: string;
  birthday: string;
  email: string;
  simCardNumber: string;
  activationAt: string;
  remark: string;
  status: number;
  createdAt: string;
  updatedAt: string;
}

type Data = Worker;

export async function GetWorker(api: KyInstance, id: number) {
  const res = await api.get<SuccessResponseJson<Data>>(`backend/workers/${id}`, {}).json();
  return res;
}
