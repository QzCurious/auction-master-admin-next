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
    actionType: z.number(),
    shipmentType: z.number(),
    itemIDs: z.array(z.number()),
    auctionItemIDs: z.array(z.number()),
    address: z.string().min(1),
    storeNumber: z.string().min(1),
    storeName: z.string().min(1),
    recipientName: z.string().min(1),
    phone: z.string().min(1),
    shipmentTrackingNumber: z.string().min(1),
    internationalShippingCosts: z.number(),
    remark: z.string(),
    status: z.number(),
  })
  .partial();

type Data = 'Success';

type ErrorCode = never;

export async function UpdateShipping(id: Shipping['id'], payload: z.input<typeof ReqSchema>) {
  const data = throwIfInvalid(payload, ReqSchema);

  const urlencoded = new URLSearchParams();
  appendEntries(urlencoded, data);

  const res = await withAuth(apiClient)<Data, ErrorCode>(`/backend/shippings/${id}`, {
    method: 'PATCH',
    body: urlencoded,
  });

  revalidateTag('shippings');

  return res;
}
