import { z } from 'zod';

import { apiClient } from '../../apiClient';
import { throwIfInvalid } from '../../helpers/throwIfInvalid';
import { withAuth } from '../../withAuth';
import { ITEM_STATUS_DATA } from '../configs';

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
  nickname: string;
  type: number;
  name: string;
  description: string;
  photos: Array<{
    sorted: number;
    photo: string;
  }>;
  space: number;
  minEstimatedPrice: number;
  maxEstimatedPrice: number;
  reservePrice: number;
  expireAt: string;
  status: number;
  createdAt: string;
  updatedAt: string;
}

interface Data {
  items: Array<Item>;
  count: number;
}

type ErrorCode = never;

export async function items(payload: z.input<typeof ReqSchema>) {
  'use server';
  const parsed = throwIfInvalid(payload, ReqSchema);

  const status = ITEM_STATUS_DATA.find(({ key }) => key === 'InitStatus')?.value;

  if (!status) {
    throw new Error('ITEM_STATUS_DATA might not be up to date');
  }

  const query = new URLSearchParams();
  parsed.consignorID != null && query.append('consignorID', parsed.consignorID.toString());
  parsed.status != null && query.append('status', parsed.status.toString());
  parsed.sort != null && query.append('sort', parsed.sort);
  parsed.order != null && query.append('order', parsed.order);
  parsed.limit != null && query.append('limit', parsed.limit.toString());
  parsed.offset != null && query.append('offset', parsed.offset.toString());

  const res = await withAuth(apiClient)<Data, ErrorCode>(`/items?${query}`, {
    method: 'GET',
    next: { tags: ['items'] },
  });

  return res;
}
