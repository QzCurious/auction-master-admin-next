'use server';

import { z } from 'zod';

import { apiClient } from '../../apiClient';
import { throwIfInvalid } from '../../helpers/throwIfInvalid';
import { withAuth } from '../../withAuth';
import { type CONSIGNOR_STATUS_DATA } from '../configs.data';

const ReqSchema = z.object({
  fuzzyNickname: z.string().optional(),
  status: z.coerce.number().optional(),
  sort: z.string().optional(),
  order: z.enum(['asc', 'desc']).optional(),
  limit: z.coerce.number(),
  offset: z.coerce.number(),
});

export interface Consignor {
  id: number;
  account: string;
  password: string;
  nickname: string;
  name: string;
  identification: string;
  phone: string;
  bankCode: string;
  bankAccount: string;
  status: (typeof CONSIGNOR_STATUS_DATA)[number]['value'];
  createdAt: string;
  updatedAt: string;
}

interface Data {
  consignors: Array<Consignor>;
  count: number;
}

type ErrorCode = never;

export async function AdminGetConsignors(payload: z.input<typeof ReqSchema>) {
  const parsed = throwIfInvalid(payload, ReqSchema);

  const query = new URLSearchParams();
  parsed.fuzzyNickname && query.append('fuzzyNickname', parsed.fuzzyNickname);
  parsed.status != null && query.append('status', parsed.status.toString());
  parsed.sort != null && query.append('sort', parsed.sort);
  parsed.order != null && query.append('order', parsed.order);
  parsed.limit != null && query.append('limit', parsed.limit.toString());
  parsed.offset != null && query.append('offset', parsed.offset.toString());

  const res = await withAuth(apiClient)<Data, ErrorCode>(`/consignors?${query}`, {
    method: 'GET',
    next: { tags: ['consignors'] },
  });

  return res;
}
