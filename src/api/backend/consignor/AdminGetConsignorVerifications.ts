'use server';

import { appendEntries } from '@/domain/crud/appendEntries';
import { type CONSIGNOR_VERIFICATION_STATUS } from '@/domain/static/static-config-mappers';
import { z } from 'zod';

import { apiClient } from '../../apiClient';
import { throwIfInvalid } from '../../helpers/throwIfInvalid';
import { withAuth } from '../../withAuth';

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

type ErrorCode = never;

export async function AdminGetConsignorVerifications(payload: z.input<typeof ReqSchema>) {
  const parsed = throwIfInvalid(payload, ReqSchema);

  const query = new URLSearchParams();
  appendEntries(query, parsed);

  const res = await withAuth(apiClient)<Data, ErrorCode>(`/backend/consignors/verifications?${query}`, {
    method: 'GET',
    next: { tags: ['consignorsVerifications'] },
  });

  return res;
}
