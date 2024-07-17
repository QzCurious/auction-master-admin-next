'use server';

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
  status: number;
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
  parsed.account && query.append('account', parsed.account);
  parsed.status != null && query.append('status', parsed.status.toString());
  parsed.sort != null && query.append('sort', parsed.sort);
  parsed.order != null && query.append('order', parsed.order);
  parsed.limit != null && query.append('limit', parsed.limit.toString());
  parsed.offset != null && query.append('offset', parsed.offset.toString());

  const res = await withAuth(apiClient)<Data, ErrorCode>(`/consignors/verifications?${query}`, {
    method: 'GET',
    next: { tags: ['consignorsVerifications'] },
  });

  return res;
}
