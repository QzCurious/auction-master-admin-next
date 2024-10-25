'use server';

import { revalidateTag } from 'next/cache';
import { apiClientWithToken } from '@/api/core/apiClientWithToken';
import { createApiErrorServerSide } from '@/api/core/ApiError/createApiErrorServerSide';
import { throwIfInvalid, type SuccessResponseJson } from '@/api/core/static';
import { appendEntries } from '@/domain/crud/appendEntries';
import { SHIPMENT_TYPE } from '@/domain/static/static-config-mappers';
import * as R from 'remeda';
import { z } from 'zod';

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

export async function ItemReturning(payload: z.output<typeof ReqSchema>) {
  const data = throwIfInvalid(payload, ReqSchema);

  const urlencoded = new URLSearchParams();
  appendEntries(urlencoded, data);

  const res = await apiClientWithToken
    .post<SuccessResponseJson<Data>>('backend/items/returning', {
      body: urlencoded,
    })
    .json()
    .catch(createApiErrorServerSide);

  revalidateTag('items');

  return res;
}
