'use server';

import { revalidateTag } from 'next/cache';
import { z } from 'zod';

import { apiClient } from '../../apiClient';
import { throwIfInvalid } from '../../helpers/throwIfInvalid';
import { withAuth } from '../../withAuth';
import { ITEM_TYPE_DATA } from '../configs.data';

const ReqSchema = z.object({
  consignorID: z.number().optional(),
  type: z
    .number()
    .refine((v) => v === 0 || ITEM_TYPE_DATA.find((item) => item.value === v))
    .optional(),
  name: z.string().min(1).optional(),
  description: z.string().nullable().optional(),
  directPurchasePrice: z.number().optional(),
  minEstimatedPrice: z.number().optional(),
  maxEstimatedPrice: z.number().optional(),
  reservePrice: z.number().min(1).optional(),
  expireAt: z.date().nullable().optional(),
  warehouseID: z.string().optional(),
  space: z.number().min(1).optional(),
  grossWeight: z.number().optional(),
  volumetricWeight: z.number().optional(),
  status: z.number().optional(),
});

type Data = 'Success';

type ErrorCode = never;

export async function AdminUpdateItem(id: number, payload: z.input<typeof ReqSchema>) {
  const data = throwIfInvalid(payload, ReqSchema);

  const formData = new FormData();
  data.consignorID != null && formData.append('consignorID', data.consignorID.toString());
  data.type != null && formData.append('type', data.type.toString());
  data.name != null && formData.append('name', data.name);
  data.description != null && formData.append('description', data.description);
  data.directPurchasePrice != null && formData.append('directPurchasePrice', data.directPurchasePrice.toString());
  data.minEstimatedPrice != null && formData.append('minEstimatedPrice', data.minEstimatedPrice.toString());
  data.maxEstimatedPrice != null && formData.append('maxEstimatedPrice', data.maxEstimatedPrice.toString());
  data.reservePrice != null && formData.append('reservePrice', data.reservePrice.toString());
  data.expireAt != null && formData.append('expireAt', data.expireAt.toISOString());
  data.warehouseID != null && formData.append('warehouseID', data.warehouseID);
  data.space != null && formData.append('space', data.space.toString());
  data.grossWeight != null && formData.append('grossWeight', data.grossWeight.toString());
  data.volumetricWeight != null && formData.append('volumetricWeight', data.volumetricWeight.toString());
  data.status != null && formData.append('status', data.status.toString());

  const res = await withAuth(apiClient)<Data, ErrorCode>(`/items/${id}`, {
    method: 'PATCH',
    body: formData,
  });

  revalidateTag('items');

  return res;
}
