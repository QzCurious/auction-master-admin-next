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
  space: z.number().min(1).optional(),
  minEstimatedPrice: z.number().optional(),
  maxEstimatedPrice: z.number().optional(),
  sellerID: z.number().optional(),
  reservePrice: z.number().min(1),
  expireAt: z.date().nullable().optional(),
  status: z.number().optional(),
});

type Data = 'Success';

type ErrorCode = never;

export async function updateItem(id: number, payload: z.input<typeof ReqSchema>) {
  const data = throwIfInvalid(payload, ReqSchema);

  const formData = new FormData();
  data.consignorID && formData.append('consignorID', data.consignorID.toString());
  data.type && formData.append('type', data.type.toString());
  data.name && formData.append('name', data.name);
  data.description && formData.append('description', data.description);
  data.space && formData.append('space', data.space.toString());
  data.minEstimatedPrice && formData.append('minEstimatedPrice', data.minEstimatedPrice.toString());
  data.maxEstimatedPrice && formData.append('maxEstimatedPrice', data.maxEstimatedPrice.toString());
  data.sellerID && formData.append('sellerID', data.sellerID.toString());
  data.reservePrice && formData.append('reservePrice', data.reservePrice.toString());
  data.expireAt && formData.append('expireAt', data.expireAt.toISOString());
  data.status && formData.append('status', data.status.toString());

  const res = await withAuth(apiClient)<Data, ErrorCode>(`/items/${id}`, {
    method: 'PATCH',
    body: formData,
  });

  revalidateTag('items');

  return res;
}
