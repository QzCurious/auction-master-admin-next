'use server';

import { revalidateTag } from 'next/cache';
import { apiClient } from '@/api/apiClient';
import { throwIfInvalid } from '@/api/helpers/throwIfInvalid';
import { withAuth } from '@/api/withAuth';
import { z } from 'zod';

import { type Shipping } from './GetShippings';

const ReqSchema = z.object({
  shipmentTrackingNumber: z.string(),
  internationalShippingCosts: z.number(),
});

type Data = 'Success';

type ErrorCode = never;

export async function Shipped(id: Shipping['id'], payload: z.input<typeof ReqSchema>) {
  const data = throwIfInvalid(payload, ReqSchema);
  const formData = new FormData();

  formData.append('shipmentTrackingNumber', data.shipmentTrackingNumber);
  formData.append('internationalShippingCosts', data.internationalShippingCosts.toString());

  const res = await withAuth(apiClient)<Data, ErrorCode>(`/shippings/${id}/shipped`, {
    method: 'POST',
    body: formData,
  });

  revalidateTag('shippings');

  return res;
}
