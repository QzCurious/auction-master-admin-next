import { throwIfInvalid, type SuccessResponseJson } from '@/api/core/static';
import { appendEntries } from '@/domain/crud/appendEntries';
import { ITEM_TYPE } from '@/domain/static/static-config-mappers';
import { type KyInstance } from 'ky';
import * as R from 'remeda';
import { z } from 'zod';

export const UpdateItemSchema = z
  .object({
    consignorId: z.number(),
    type: z.number().refine(R.isIncludedIn([0, ...ITEM_TYPE.data.map((item) => item.value)] as const)),
    isNew: z.boolean(),
    name: z.string().min(1),
    description: z.string().nullable(),
    directPurchasePrice: z.number(),
    minEstimatedPrice: z.number(),
    maxEstimatedPrice: z.number(),
    reservePrice: z.number().min(1),
    expireAt: z.date().nullable(),
    warehouseId: z.string(),
    space: z.number(),
    shippingCostsWithinJapan: z.number(),
    grossWeight: z.number(),
    volumetricWeight: z.number(),
    status: z.number(),
  })
  .partial();

type Data = 'Success';

export async function AdminUpdateItem(api: KyInstance, id: number, payload: z.input<typeof UpdateItemSchema>) {
  const data = throwIfInvalid(payload, UpdateItemSchema);

  const urlencoded = new URLSearchParams();
  appendEntries(urlencoded, data);

  return api.patch<SuccessResponseJson<Data>>(`backend/items/${id}`, { body: urlencoded }).json();
}
