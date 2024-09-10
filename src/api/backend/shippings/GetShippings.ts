'use server';

import { appendEntries } from '@/static';
import { z } from 'zod';

import { apiClient } from '../../apiClient';
import { throwIfInvalid } from '../../helpers/throwIfInvalid';
import { withAuth } from '../../withAuth';
import { type ACTION_TYPE, type SHIPMENT_TYPE, type SHIPPING_STATUS } from '../static-configs.data';

const ReqSchema = z.object({
  status: z.coerce.number().array().optional(),
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
  address: string;
  recipientName: string;
  phone: string;
  shipmentTrackingNumber: string | null;
  status: SHIPPING_STATUS['value'];
  createdAt: string;
  updatedAt: string;
  items: Array<Item>;
  auctionItems: Array<AuctionItem>;
}

interface Item {
  id: number;
  consignorID: number;
  type: number;
  isNew: boolean;
  name: string;
  description: string;
  directPurchasePrice: number;
  minEstimatedPrice: number;
  maxEstimatedPrice: number;
  reservePrice: number;
  expireAt: string;
  warehouseID: string;
  space: number;
  grossWeight: number;
  volumetricWeight: number;
  status: number;
  createdAt: string;
  updatedAt: string;
  nickname: string;
  photos: Array<{
    sorted: number;
    photo: string;
    createdAt: string;
    updatedAt: string;
  }>;
  pastStatuses: {
    '1': string;
    '11': string;
    '14': string;
    '21': string;
    '24': string;
    '25': string;
    '26': string;
    '27': string;
    '3': string;
  };
}

interface AuctionItem {
  id: number;
  consignorID: number;
  itemID: number;
  sellerID: number;
  watcherID: number;
  auctionID: string;
  name: string;
  photo: string;
  reservePrice: number;
  currentPrice: number;
  highestPrice: number;
  closeAt: string;
  closedPrice: number;
  status: number;
  createdAt: string;
  updatedAt: string;
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

  const res = await withAuth(apiClient)<Data, ErrorCode>(`/shippings?${query}`, {
    method: 'GET',
    next: { tags: ['shippings'] },
  });

  return res;
}
