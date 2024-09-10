'use server';

import { revalidateTag } from 'next/cache';
import { appendEntries } from '@/static';
import * as R from 'remeda';
import { z } from 'zod';

import { apiClient } from '../../apiClient';
import { throwIfInvalid } from '../../helpers/throwIfInvalid';
import { withAuth } from '../../withAuth';
import { ITEM_TYPE } from '../static-configs.data';

const ReqSchema = z.object({
  consignorID: z.number().optional(),
  type: z
    .number()
    .refine(R.isIncludedIn([0, ...ITEM_TYPE.data.map((item) => item.value)] as const))
    .optional(),
  name: z.string().min(1).optional(),
  description: z.string().nullable().optional(),
  directPurchasePrice: z.number().optional(),
  minEstimatedPrice: z.number().optional(),
  maxEstimatedPrice: z.number().optional(),
  reservePrice: z.number().min(1).optional(),
  expireAt: z.date().nullable().optional(),
  warehouseID: z.string().optional(),
  space: z.number().optional(),
  shippingCostsWithinJapan: z.number().optional(),
  grossWeight: z.number().optional(),
  volumetricWeight: z.number().optional(),
  status: z.number().optional(),
});

type Data = 'Success';

type ErrorCode = never;

export async function AdminUpdateItem(id: number, payload: z.input<typeof ReqSchema>) {
  const data = throwIfInvalid(payload, ReqSchema);

  const formData = new FormData();
  appendEntries(formData, data);

  const res = await withAuth(apiClient)<Data, ErrorCode>(`/items/${id}`, {
    method: 'PATCH',
    body: formData,
  });

  revalidateTag('items');

  return res;
}
