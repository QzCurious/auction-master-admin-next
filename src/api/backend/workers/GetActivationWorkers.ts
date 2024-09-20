'use server';

import { apiClient } from '../../apiClient';
import { withAuth } from '../../withAuth';
import { type WORKER_STATUS, type WORKER_TYPE } from '@/domain/static/static-config-mappers';

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

type ErrorCode = never;

export async function GetActivationWorkers() {
  const res = await withAuth(apiClient)<Data, ErrorCode>('/workers/activation', {
    method: 'GET',
    next: { tags: ['workers'] },
  });

  return res;
}
