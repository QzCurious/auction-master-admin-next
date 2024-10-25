'use server';

import { revalidateTag } from 'next/cache';
import { apiClientWithToken } from '@/api/core/apiClientWithToken';
import { createApiErrorServerSide } from '@/api/core/ApiError/createApiErrorServerSide';
import { throwIfInvalid, type SuccessResponseJson } from '@/api/core/static';
import { SHIPMENT_TYPE } from '@/domain/static/static-config-mappers';
import { z } from 'zod';

const ReqSchema = z.discriminatedUnion('shipmentType', [
  z.object({
    shipmentType: z.literal(SHIPMENT_TYPE.enum('AddressShipmentType')),
    auctionIds: z.array(z.string()),
    address: z.string(),
    recipientName: z.string(),
    phone: z.string(),
    remark: z.string().optional(),
  }),
  z.object({
    shipmentType: z.literal(SHIPMENT_TYPE.enum('SevenElevenShipmentType')),
    auctionIds: z.array(z.string()),
    storeNumber: z.string(),
    storeName: z.string(),
    recipientName: z.string(),
    phone: z.string(),
    remark: z.string().optional(),
  }),
  z.object({
    shipmentType: z.literal(SHIPMENT_TYPE.enum('FamilyShipmentType')),
    auctionIds: z.array(z.string()),
    storeNumber: z.string(),
    storeName: z.string(),
    recipientName: z.string(),
    phone: z.string(),
    remark: z.string().optional(),
  }),
]);

type Data = 'Success';

export async function ShippingAuctionItem(payload: z.input<typeof ReqSchema>) {
  const data = throwIfInvalid(payload, ReqSchema);

  const res = await apiClientWithToken
    .post<SuccessResponseJson<Data>>(`backend/auction-items/shipping`, {
      json: data,
    })
    .json()
    .catch(createApiErrorServerSide);

  revalidateTag('auction-items');

  return res;
}
