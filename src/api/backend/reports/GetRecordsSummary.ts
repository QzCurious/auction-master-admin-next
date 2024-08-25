'use server';

import { apiClient } from '@/api/apiClient';
import { throwIfInvalid } from '@/api/helpers/throwIfInvalid';
import { withAuth } from '@/api/withAuth';
import { z } from 'zod';

const ReqSchema = z.object({
  startAt: z.string().date().optional(),
  endAt: z.string().date().optional(),
});

export interface Report {
  totalClosedPrice: number;
  totalPrice: number;
  totalDirectPurchasePrice: number;
  totalPurchasedPrice: number;
  totalYahooFee: number;
  totalCommission: number;
  totalBonus: number;
  totalProfit: number;
  totalSpaceFee: number;
  totalShippingCost: number;
}

interface Data {
  JPY?: Report;
  TWD?: Report;
}

type ErrorCode = never;

export async function GetRecordsSummary(payload: z.input<typeof ReqSchema>) {
  const data = throwIfInvalid(payload, ReqSchema);

  const query = new URLSearchParams();
  data.startAt && query.append('startAt', data.startAt);
  data.endAt && query.append('endAt', data.endAt);

  const res = await withAuth(apiClient)<Data, ErrorCode>(`/records/summary?${query}`, {
    method: 'GET',
    next: {
      tags: ['reports'],
    },
  });

  return res;
}
