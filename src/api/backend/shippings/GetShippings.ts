'use server';

import { apiClientWithToken } from '@/api/core/apiClientWithToken';
import { createApiErrorServerSide } from '@/api/core/ApiError/createApiErrorServerSide';
import { throwIfInvalid, type SuccessResponseJson } from '@/api/core/static';
import { appendEntries } from '@/domain/crud/appendEntries';
import { type ACTION_TYPE, type SHIPMENT_TYPE, type SHIPPING_STATUS } from '@/domain/static/static-config-mappers';
import { z } from 'zod';

import { type AuctionItem } from '../auction-items/GetAuctionItem';
import { type Item } from '../items/GetItemAndDetails';

const ReqSchema = z.object({
  auctionId: z.string().array().optional(),
  status: z.coerce.number().array().optional(),
  startAt: z.coerce.date().optional(),
  endAt: z.coerce.date().optional(),
  sort: z.string().optional(),
  order: z.enum(['asc', 'desc']).optional(),
  limit: z.coerce.number().default(10),
  offset: z.coerce.number().default(0),
});

export interface Shipping {
  id: string;
  actionType: ACTION_TYPE['value'];
  shipmentType: SHIPMENT_TYPE['value'];
  itemIds?: Array<number>;
  auctionIds?: Array<string>;
  address: string;
  storeNumber?: string;
  storeName?: string;
  recipientName: string;
  phone: string;
  shipmentTrackingNumber?: string;
  internationalShippingCosts?: number;
  remark?: string;
  status: SHIPPING_STATUS['value'];
  createdAt: string;
  updatedAt: string;
  items?: Array<Item>;
  auctionItems?: Array<AuctionItem>;
}

interface Data {
  shippings: Array<Shipping>;
  count: number;
}

export async function GetShippings(payload: z.input<typeof ReqSchema>) {
  const data = throwIfInvalid(payload, ReqSchema);

  const query = new URLSearchParams();
  appendEntries(query, data);

  const res = await apiClientWithToken
    .get<SuccessResponseJson<Data>>(`backend/shippings?${query}`, {
      next: { tags: ['shippings'] },
    })
    .json()
    .catch(createApiErrorServerSide);

  return res;
}
