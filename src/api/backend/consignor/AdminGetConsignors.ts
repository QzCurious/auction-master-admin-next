'use server';

import { apiClientWithToken } from '@/api/core/apiClientWithToken';
import { createApiErrorServerSide } from '@/api/core/ApiError/createApiErrorServerSide';
import { throwIfInvalid, type SuccessResponseJson } from '@/api/core/static';
import { appendEntries } from '@/domain/crud/appendEntries';
import { type CONSIGNOR_STATUS } from '@/domain/static/static-config-mappers';
import { z } from 'zod';

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
  beneficiaryName: string | null;
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

export async function AdminGetConsignors(payload: z.input<typeof ReqSchema>) {
  const data = throwIfInvalid(payload, ReqSchema);

  const query = new URLSearchParams();
  appendEntries(query, data);

  const res = await apiClientWithToken
    .get<SuccessResponseJson<Data>>(`backend/consignors?${query}`, {
      next: { tags: ['consignors'] },
    })
    .json()
    .catch(createApiErrorServerSide);

  return res;
}
