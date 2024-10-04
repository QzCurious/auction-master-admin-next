'use server';

import { revalidateTag } from 'next/cache';
import { apiClient } from '@/api/apiClient';
import { throwIfInvalid } from '@/api/helpers/throwIfInvalid';
import { withAuth } from '@/api/withAuth';
import { appendEntries } from '@/domain/crud/appendEntries';
import { z } from 'zod';

import { type Shipping } from './GetShippings';

const ReqSchema = z
  .object({
    shippingCostsWithinJapan: z.number(),
  })
  .partial();

type Data = 'Success';

type ErrorCode = never;

export async function ShippingClosed(id: Shipping['id'], payload: z.input<typeof ReqSchema>) {
  const data = throwIfInvalid(payload, ReqSchema);

  const urlencoded = new URLSearchParams();
  appendEntries(urlencoded, data);

  const res = await withAuth(apiClient)<Data, ErrorCode>(`/backend/shippings/${id}/closed`, {
    method: 'POST',
    body: urlencoded,
  });

  revalidateTag('shippings');

  return res;
}
