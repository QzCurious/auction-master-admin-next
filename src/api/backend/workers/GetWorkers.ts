'use server';

import { apiClientWithToken } from '@/api/core/apiClientWithToken';
import { createApiErrorServerSide } from '@/api/core/ApiError/createApiErrorServerSide';
import { throwIfInvalid, type SuccessResponseJson } from '@/api/core/static';
import { appendEntries } from '@/domain/crud/appendEntries';
import { type WORKER_TYPE } from '@/domain/static/static-config-mappers';
import { z } from 'zod';

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

export async function GetWorkers(payload: z.input<typeof ReqSchema>) {
  const data = throwIfInvalid(payload, ReqSchema);

  const query = new URLSearchParams();
  appendEntries(query, data);

  const res = await apiClientWithToken
    .get<SuccessResponseJson<Data>>(`backend/workers?${query}`, {
      next: { tags: ['workers'] },
    })
    .json()
    .catch(createApiErrorServerSide);

  return res;
}
