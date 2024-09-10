'use server';

import { appendEntries } from '@/static';
import { z } from 'zod';

import { apiClient } from '../../apiClient';
import { throwIfInvalid } from '../../helpers/throwIfInvalid';
import { withAuth } from '../../withAuth';
import { type CONSIGNOR_VERIFICATION_STATUS } from '../static-configs.data';

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
  nickname: string;
  name: string;
  identification: string;
  gender: number;
  birthday: string;
  city: string;
  district: string;
  streetAddress: string;
  photo: string;
  phone: string;
  bankCode: string;
  bankAccount: string;
  status: CONSIGNOR_VERIFICATION_STATUS['value'];
  createdAt: string;
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

  const res = await withAuth(apiClient)<Data, ErrorCode>(`/consignors/verifications?${query}`, {
    method: 'GET',
    next: { tags: ['consignorsVerifications'] },
  });

  return res;
}
