'use server';

import { appendEntries } from '@/domain/crud/appendEntries';
import { type ACTION_TYPE, type SHIPMENT_TYPE, type SHIPPING_STATUS } from '@/domain/static/static-config-mappers';
import { z } from 'zod';

import { apiClient } from '../../apiClient';
import { throwIfInvalid } from '../../helpers/throwIfInvalid';
import { withAuth } from '../../withAuth';
import { type AuctionItem } from '../auction-items/GetAuctionItems';
import { type Item } from '../items/GetItemsAndDetails';

const ReqSchema = z.object({
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
  itemIDs: Array<number>;
  auctionItemIDs: Array<number>;
  address: string;
  recipientName: string;
  phone: string;
  shipmentTrackingNumber?: string;
  remark?: string;
  status: SHIPPING_STATUS['value'];
  createdAt: string;
  updatedAt: string;
  items: Array<Item>;
  auctionItems: Array<AuctionItem>;
  internationalShippingCosts?: number;
}

interface Data {
  shippings: Array<Shipping>;
  count: number;
}

type ErrorCode = never;

export async function GetShippings(payload: z.input<typeof ReqSchema>) {
  const data = throwIfInvalid(payload, ReqSchema);

  const query = new URLSearchParams();
  appendEntries(query, data);

  const res = await withAuth(apiClient)<Data, ErrorCode>(`/backend/shippings?${query}`, {
    method: 'GET',
    next: { tags: ['shippings'] },
  });

  return res;
}
