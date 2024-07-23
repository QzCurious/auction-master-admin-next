import { apiClient } from '../../apiClient';
import { withAuth } from '../../withAuth';
import { type WORKER_STATUS_DATA, type WORKER_TYPE_DATA } from '../configs.data';

export interface Worker {
  id: number;
  type: (typeof WORKER_TYPE_DATA)[number]['value'];
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
  status: (typeof WORKER_STATUS_DATA)[number]['value'];
  createdAt: string;
  updatedAt: string;
}

type Data = Array<Worker>;

type ErrorCode = never;

export async function GetActivationWorkers() {
  'use server';
  const res = await withAuth(apiClient)<Data, ErrorCode>('/workers/activation', {
    method: 'GET',
    next: { tags: ['workers'] },
  });

  return res;
}
