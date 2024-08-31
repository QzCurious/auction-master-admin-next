'use server';

import { apiClient } from '@/api/apiClient';
import { throwIfInvalid } from '@/api/helpers/throwIfInvalid';
import { withAuth } from '@/api/withAuth';
import { type Currency } from '@/static';
import { z } from 'zod';

import { type RECORD_STATUS, type RECORD_TYPE } from '../static-configs.data';

const ReqSchema = z.object({
  type: z.number().array().optional(),
  consignorID: z.number().optional(),
  status: z.number().array().optional(),
  startAt: z.date().optional(),
  endAt: z.date().optional(),
  sort: z.string().optional(),
  order: z.enum(['asc', 'desc']).optional(),
  limit: z.coerce.number().default(10),
  offset: z.coerce.number().default(0),
});

export interface Record {
  id: string;
  type: RECORD_TYPE['value'];
  consignorID: number;
  consignorNickname: string;
  opCode: string;
  itemID?: number;
  auctionItemID?: number;
  currency: Currency;
  exchangeRate?: number;
  jpyWithdrawal?: number;
  withdrawal?: number;
  closedPrice?: number;
  price?: number;
  directPurchasePrice?: number;
  purchasedPrice?: number;
  yahooAuctionFeeRate?: number;
  yahooAuctionFee?: number;
  commissionRate?: number;
  commission?: number;
  bonusRate?: number;
  bonus?: number;
  profit?: number;
  yahooCancellationFee?: number;
  spaceFee?: number;
  shippingCost?: number;
  status: RECORD_STATUS['value'];
  createdAt: string;
  updatedAt: string;
}

interface Data {
  records: Record[];
  count: number;
}

type ErrorCode = never;

export async function GetRecords(payload: z.input<typeof ReqSchema>) {
  const data = throwIfInvalid(payload, ReqSchema);

  const query = new URLSearchParams();
  for (const type of data.type ?? []) {
    query.append('type', type.toString());
  }
  data.consignorID && query.append('consignorID', data.consignorID.toString());
  for (const status of data.status ?? []) {
    query.append('status', status.toString());
  }
  data.startAt && query.append('startAt', data.startAt.toISOString());
  data.endAt && query.append('endAt', data.endAt.toISOString());
  data.sort != null && query.append('sort', data.sort);
  data.order != null && query.append('order', data.order);
  data.offset != null && query.append('offset', data.offset.toString());
  data.limit != null && query.append('limit', data.limit.toString());

  const res = await withAuth(apiClient)<Data, ErrorCode>(`/reports/records?${query}`, {
    method: 'GET',
    next: {
      tags: ['records'],
    },
  });

  return res;
}
