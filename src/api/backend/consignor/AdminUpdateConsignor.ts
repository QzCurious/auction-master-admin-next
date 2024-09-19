'use server';

import { revalidateTag } from 'next/cache';
import { appendEntries } from '@/static';
import { z } from 'zod';

import { apiClient } from '../../apiClient';
import { throwIfInvalid } from '../../helpers/throwIfInvalid';
import { withAuth } from '../../withAuth';

const ReqSchema = z
  .object({
    password: z.string(),
    nickname: z.string(),
    status: z.number(),
    commissionBonusRate: z.number(),
  })
  .partial();

type Data = 'Success';

type ErrorCode = never;

export async function AdminUpdateConsignor(id: number, payload: z.input<typeof ReqSchema>) {
  const data = throwIfInvalid(payload, ReqSchema);

  const urlencoded = new URLSearchParams();
  appendEntries(urlencoded, data);

  const res = await withAuth(apiClient)<Data, ErrorCode>(`/consignors/${id}`, {
    method: 'PATCH',
    body: urlencoded,
  });

  revalidateTag('consignors');

  return res;
}
