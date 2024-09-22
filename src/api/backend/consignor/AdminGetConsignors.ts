'use server';

import { appendEntries } from '@/domain/crud/appendEntries';
import { type CONSIGNOR_STATUS } from '@/domain/static/static-config-mappers';
import { z } from 'zod';

import { apiClient } from '../../apiClient';
import { throwIfInvalid } from '../../helpers/throwIfInvalid';
import { withAuth } from '../../withAuth';

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
  avatar: string;
  account: string;
  password: string;
  nickname: string;
  commissionBonusRate: number;
  name: string;
  identification: string;
  gender: 1 | 2;
  birthday: string;
  city: string;
  district: string;
  streetAddress: string;
  phone: string;
  bankCode: string;
  bankAccount: string;
  status: CONSIGNOR_STATUS['value'];
  createdAt: string;
  updatedAt: string;
  walletBalance: number;
  bonusBalance: number;
}

interface Data {
  consignors: Array<Consignor>;
  count: number;
}

type ErrorCode = never;

export async function AdminGetConsignors(payload: z.input<typeof ReqSchema>) {
  const data = throwIfInvalid(payload, ReqSchema);

  const query = new URLSearchParams();
  appendEntries(query, data);

  const res = await withAuth(apiClient)<Data, ErrorCode>(`/consignors?${query}`, {
    method: 'GET',
    next: { tags: ['consignors'] },
  });

  return res;
}
