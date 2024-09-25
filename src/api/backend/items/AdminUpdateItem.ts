'use server';

import { revalidateTag } from 'next/cache';
import { appendEntries } from '@/domain/crud/appendEntries';
import * as R from 'remeda';
import { z } from 'zod';

import { apiClient } from '../../apiClient';
import { throwIfInvalid } from '../../helpers/throwIfInvalid';
import { withAuth } from '../../withAuth';
import { ITEM_TYPE } from '@/domain/static/static-config-mappers';

const ReqSchema = z
  .object({
    consignorID: z.number(),
    type: z.number().refine(R.isIncludedIn([0, ...ITEM_TYPE.data.map((item) => item.value)] as const)),
    isNew: z.boolean(),
    name: z.string().min(1),
    description: z.string().nullable(),
    directPurchasePrice: z.number(),
    minEstimatedPrice: z.number(),
    maxEstimatedPrice: z.number(),
    reservePrice: z.number().min(1),
    expireAt: z.date().nullable(),
    warehouseID: z.string(),
    space: z.number(),
    shippingCostsWithinJapan: z.number(),
    grossWeight: z.number(),
    volumetricWeight: z.number(),
    status: z.number(),
  })
  .partial();

type Data = 'Success';

type ErrorCode =
  // same warehouseId
  '1031';

export async function AdminUpdateItem(id: number, payload: z.input<typeof ReqSchema>) {
  const data = throwIfInvalid(payload, ReqSchema);

  const urlencoded = new URLSearchParams();
  appendEntries(urlencoded, data);

  const res = await withAuth(apiClient)<Data, ErrorCode>(`/backend/items/${id}`, {
    method: 'PATCH',
    body: urlencoded,
  });

  revalidateTag('items');

  return res;
}
