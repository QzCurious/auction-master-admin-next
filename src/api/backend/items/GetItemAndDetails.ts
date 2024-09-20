'use server';

import { z } from 'zod';

import { apiClient } from '../../apiClient';
import { withAuth } from '../../withAuth';
import { type ITEM_STATUS, type ITEM_TYPE } from '@/domain/static/static-config-mappers';

const ReqSchema = z.object({
  consignorID: z.coerce.number().optional(),
  status: z.coerce.number().optional(),
  sort: z.string().optional(),
  order: z.enum(['asc', 'desc']).optional(),
  limit: z.coerce.number().default(10),
  offset: z.coerce.number().default(0),
});

export interface Item {
  id: number;
  consignorID: number;
  type: 0 | ITEM_TYPE['value'];
  isNew: boolean;
  name: string;
  description: string;
  directPurchasePrice: number;
  minEstimatedPrice: number;
  maxEstimatedPrice: number;
  reservePrice: number;
  expireAt: string | null;
  warehouseID: string;
  space: number;
  shippingCostsWithinJapan: number;
  grossWeight: number;
  volumetricWeight: number;
  status: ITEM_STATUS['value'];
  createdAt: string;
  updatedAt: string;
  nickname: string;
  photos: Array<{
    sorted: number;
    photo: string;
    createdAt: string;
    updatedAt: string;
  }>;
  pastStatuses?: { [k in ITEM_STATUS['value']]?: string };
  auctionItemID?: number;
  recordID?: string;
}

interface Data extends Item {}

type ErrorCode = never;

export async function GetItemAndDetails(id: number) {
  const res = await withAuth(apiClient)<Data, ErrorCode>(`/items/${id}`, {
    method: 'GET',
    next: { tags: ['items'] },
  });

  return res;
}
