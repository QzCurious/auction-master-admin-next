'use server';

import { appendEntries } from '@/domain/crud/appendEntries';
import { z } from 'zod';

import { apiClient } from '../../apiClient';
import { throwIfInvalid } from '../../helpers/throwIfInvalid';
import { withAuth } from '../../withAuth';
import { type WORKER_TYPE } from '@/domain/static/static-config-mappers';

const ReqSchema = z.object({
  type: z.string().array().optional(),
  status: z.coerce.number().array().optional(),
  limit: z.coerce.number().default(10),
  offset: z.coerce.number().default(0),
});

export interface Worker {
  id: number;
  loggedIn: boolean;
  loggedInName: string;
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
  status: number;
  createdAt: string;
  updatedAt: string;
}

interface Data {
  workers: Array<Worker>;
  count: number;
}

type ErrorCode = never;

export async function GetWorkers(payload: z.input<typeof ReqSchema>) {
  const data = throwIfInvalid(payload, ReqSchema);

  const query = new URLSearchParams();
  appendEntries(query, data);

  const res = await withAuth(apiClient)<Data, ErrorCode>(`/workers?${query}`, {
    method: 'GET',
    next: { tags: ['workers'] },
  });

  return res;
}
