'use server';

import { apiClientWithToken } from '@/api/core/apiClientWithToken';
import { createApiErrorServerSide } from '@/api/core/ApiError/createApiErrorServerSide';
import { throwIfInvalid, type SuccessResponseJson } from '@/api/core/static';
import { appendEntries } from '@/domain/crud/appendEntries';
import { type CONSIGNOR_VERIFICATION_STATUS } from '@/domain/static/static-config-mappers';
import { z } from 'zod';

const ReqSchema = z.object({
  account: z.string().optional(),
  status: z.coerce.number().optional(),
  sort: z.string().optional(),
  order: z.enum(['asc', 'desc']).optional(),
  limit: z.coerce.number(),
  offset: z.coerce.number(),
});

export interface ConsignorVerification {
  id: number;
  consignorId: number;
  photo: string;
  name: string;
  identification: string;
  gender: number;
  birthday: string;
  city: string;
  district: string;
  streetAddress: string;
  phone: string;
  beneficiaryName: string;
  bankCode: string;
  bankAccount: string;
  status: CONSIGNOR_VERIFICATION_STATUS['value'];
  createdAt: string;
  updatedAt: string;
  nickname: string;
}

interface Data {
  consignorVerifications: Array<ConsignorVerification>;
  count: number;
}

export async function AdminGetConsignorVerifications(payload: z.input<typeof ReqSchema>) {
  const parsed = throwIfInvalid(payload, ReqSchema);

  const query = new URLSearchParams();
  appendEntries(query, parsed);

  const res = await apiClientWithToken
    .get<SuccessResponseJson<Data>>(`backend/consignors/verifications?${query}`, {
      next: { tags: ['consignorsVerifications'] },
    })
    .json()
    .catch(createApiErrorServerSide);

  return res;
}
