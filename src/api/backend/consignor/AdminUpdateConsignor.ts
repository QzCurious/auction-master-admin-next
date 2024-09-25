'use server';

import { revalidateTag } from 'next/cache';
import { appendEntries } from '@/domain/crud/appendEntries';
import { CONSIGNOR_STATUS } from '@/domain/static/static-config-mappers';
import * as R from 'remeda';
import { z } from 'zod';

import { apiClient } from '../../apiClient';
import { throwIfInvalid } from '../../helpers/throwIfInvalid';
import { withAuth } from '../../withAuth';

const ReqSchema = z
  .object({
    password: z.string(),
    commissionBonusRate: z.number(),
    name: z.string().min(1),
    identification: z.string().min(1),
    gender: z.coerce.number().refine((v) => v === 1 || v === 2),
    birthday: z.coerce.date(),
    city: z.string().min(1),
    district: z.string().min(1),
    streetAddress: z.string().min(1),
    phone: z.string().min(1),
    beneficiaryName: z.string().min(1),
    bankCode: z.string().min(1),
    bankAccount: z.string().min(1),
    status: z.number().refine(R.isIncludedIn(CONSIGNOR_STATUS.data.map((item) => item.value))),
  })
  .partial();

type Data = 'Success';

type ErrorCode = never;

export async function AdminUpdateConsignor(id: number, payload: z.input<typeof ReqSchema>) {
  const data = throwIfInvalid(payload, ReqSchema);

  const urlencoded = new URLSearchParams();
  appendEntries(urlencoded, data);

  const res = await withAuth(apiClient)<Data, ErrorCode>(`/backend/consignors/${id}`, {
    method: 'PATCH',
    body: urlencoded,
  });

  revalidateTag('consignors');

  return res;
}
