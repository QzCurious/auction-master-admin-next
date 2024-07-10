import { z } from 'zod';

import { apiClient } from '../../apiClient';
import { withAuth } from '../../withAuth';
import { type ITEM_STATUS_KEY_MAP } from '../configs.data';

export const ReqSchema = z.object({
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
  type: number;
  name: string;
  description: string | null;
  photos: Array<{
    itemID: number;
    sorted: number;
    photo: string;
    createdAt: string;
    updatedAt: string;
  }>;
  space: number;
  minEstimatedPrice: number;
  maxEstimatedPrice: number;
  sellerID: number;
  reservePrice: number;
  expireAt: string | null;
  status: keyof typeof ITEM_STATUS_KEY_MAP;
  createdAt: string;
  updatedAt: string;
}

interface Data extends Item {}

type ErrorCode = never;

export async function GetItemAndDetails(id: number) {
  'use server';
  const res = await withAuth(apiClient)<Data, ErrorCode>(`/items/${id}`, {
    method: 'GET',
    next: { tags: ['items'] },
  });

  return res;
}
