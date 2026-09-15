import { type SuccessResponseJson } from '@/api/core/static';
import { type WORKER_STATUS, type WORKER_TYPE } from '@/domain/static/static-config-mappers';
import { type KyInstance } from 'ky';

export interface Worker {
  id: number;
  type: WORKER_TYPE['value'];
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
  status: WORKER_STATUS['value'];
  createdAt: string;
  updatedAt: string;
}

type Data = Array<Worker>;

export async function GetActivationWorkers(api: KyInstance) {
  const res = await api.get<SuccessResponseJson<Data>>('backend/workers/activation', {}).json();
  return res;
}
