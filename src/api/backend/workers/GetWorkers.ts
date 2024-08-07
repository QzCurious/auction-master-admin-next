import { z } from 'zod';

import { apiClient } from '../../apiClient';
import { throwIfInvalid } from '../../helpers/throwIfInvalid';
import { withAuth } from '../../withAuth';
import { type WORKER_TYPE } from '../configs.data';

export const ReqSchema = z.object({
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
  'use server';
  const parsed = throwIfInvalid(payload, ReqSchema);

  const query = new URLSearchParams();
  for (const type of parsed.type ?? []) {
    query.append('type', type.toString());
  }
  for (const status of parsed.status ?? []) {
    query.append('status', status.toString());
  }
  parsed.limit != null && query.append('limit', parsed.limit.toString());
  parsed.offset != null && query.append('offset', parsed.offset.toString());

  const res = await withAuth(apiClient)<Data, ErrorCode>(`/workers?${query}`, {
    method: 'GET',
    next: { tags: ['workers'] },
  });

  return res;
}
