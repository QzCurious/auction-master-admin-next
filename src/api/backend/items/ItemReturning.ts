'use server';

import { revalidateTag } from 'next/cache';
import { throwIfInvalid } from '@/api/helpers/throwIfInvalid';
import { appendEntries } from '@/domain/crud/appendEntries';
import { SHIPMENT_TYPE } from '@/domain/static/static-config-mappers';
import * as R from 'remeda';
import { z } from 'zod';

import { apiClient } from '../../apiClient';
import { withAuth } from '../../withAuth';

const ReqSchema = z.object({
  consignorId: z.number(),
  shipmentType: z.number().refine(R.isIncludedIn(SHIPMENT_TYPE.data.map((item) => item.value))),
  itemId: z.number().array(),
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

  const urlencoded = new URLSearchParams();
  appendEntries(urlencoded, data);

  const res = await withAuth(apiClient)<Data, ErrorCode>('/backend/items/returning', {
    method: 'POST',
    body: urlencoded,
  });

  revalidateTag('items');

  return res;
}
