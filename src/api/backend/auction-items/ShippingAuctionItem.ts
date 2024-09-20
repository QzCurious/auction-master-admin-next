'use server';

import { revalidateTag } from 'next/cache';
import { apiClient } from '@/api/apiClient';
import { throwIfInvalid } from '@/api/helpers/throwIfInvalid';
import { withAuth } from '@/api/withAuth';
import { z } from 'zod';

import { SHIPMENT_TYPE } from '@/domain/static/static-config-mappers';

const ReqSchema = z.discriminatedUnion('shipmentType', [
  z.object({
    shipmentType: z.literal(SHIPMENT_TYPE.enum('AddressShipmentType')),
    auctionItemIDs: z.array(z.number()),
    address: z.string(),
    recipientName: z.string(),
    phone: z.string(),
    shippingCostsWithinJapan: z.number(),
  }),
  z.object({
    shipmentType: z.literal(SHIPMENT_TYPE.enum('SevenElevenShipmentType')),
    auctionItemIDs: z.array(z.number()),
    storeNumber: z.string(),
    storeName: z.string(),
    recipientName: z.string(),
    phone: z.string(),
    shippingCostsWithinJapan: z.number(),
  }),
  z.object({
    shipmentType: z.literal(SHIPMENT_TYPE.enum('FamilyShipmentType')),
    auctionItemIDs: z.array(z.number()),
    storeNumber: z.string(),
    storeName: z.string(),
    recipientName: z.string(),
    phone: z.string(),
    shippingCostsWithinJapan: z.number(),
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
