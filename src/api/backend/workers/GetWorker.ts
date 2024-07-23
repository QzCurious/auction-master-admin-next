import { z } from 'zod';

import { apiClient } from '../../apiClient';
import { withAuth } from '../../withAuth';

export const ReqSchema = z.object({
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

type ErrorCode = never;

export async function GetWorker(id: number) {
  'use server';

  const res = await withAuth(apiClient)<Data, ErrorCode>(`/workers/${id}`, {
    method: 'GET',
    next: { tags: ['workers'] },
  });

  return res;
}
