'use server';

import { revalidateTag } from 'next/cache';
import { apiClient } from '@/api/apiClient';
import { throwIfInvalid } from '@/api/helpers/throwIfInvalid';
import { withAuth } from '@/api/withAuth';
import { z } from 'zod';

import { SHIPPING_TYPE } from '../configs.data';

const ReqSchema = z.discriminatedUnion('type', [
  z.object({
    type: z.literal(SHIPPING_TYPE.enum('AddressType')),
    auctionItemIDs: z.array(z.number()),
    address: z.string(),
    recipientName: z.string(),
    phone: z.string(),
  }),
  z.object({
    type: z.literal(SHIPPING_TYPE.enum('SevenElevenType')),
    auctionItemIDs: z.array(z.number()),
    storeNumber: z.string(),
    storeName: z.string(),
    recipientName: z.string(),
    phone: z.string(),
  }),
  z.object({
    type: z.literal(SHIPPING_TYPE.enum('FamilyType')),
    auctionItemIDs: z.array(z.number()),
    storeNumber: z.string(),
    storeName: z.string(),
    recipientName: z.string(),
    phone: z.string(),
  }),
]);

type Data = 'Success';

type ErrorCode = never;

export async function ShippingAuctionItem(payload: z.input<typeof ReqSchema>) {
  const data = throwIfInvalid(payload, ReqSchema);

  const res = await withAuth(apiClient)<Data, ErrorCode>(`/auction-items/shipping`, {
    method: 'POST',
    body: JSON.stringify(data),
    headers: {
      'Content-Type': 'application/json',
    },
  });

  revalidateTag('auction-items');

  return res;
}
