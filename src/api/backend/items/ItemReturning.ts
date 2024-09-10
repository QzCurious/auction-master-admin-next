'use server';

import { revalidateTag } from 'next/cache';
import { throwIfInvalid } from '@/api/helpers/throwIfInvalid';
import { appendEntries } from '@/static';
import * as R from 'remeda';
import { z } from 'zod';

import { apiClient } from '../../apiClient';
import { withAuth } from '../../withAuth';
import { SHIPMENT_TYPE } from '../static-configs.data';

const ReqSchema = z.object({
  consignorID: z.number(),
  shipmentType: z.number().refine(R.isIncludedIn(SHIPMENT_TYPE.data.map((item) => item.value))),
  itemID: z.number().array(),
  address: z.string(),
  // storeNumber: z.string(),
  // storeName: z.string(),
  recipientName: z.string(),
  phone: z.string(),
  shippingCosts: z.number(),
});

type Data = 'Success';

type ErrorCode = never;

export async function ItemReturning(payload: z.output<typeof ReqSchema>) {
  const data = throwIfInvalid(payload, ReqSchema);

  const formData = new FormData();
  appendEntries(formData, data);

  const res = await withAuth(apiClient)<Data, ErrorCode>('/items/returning', {
    method: 'POST',
    body: formData,
  });

  revalidateTag('items');

  return res;
}
