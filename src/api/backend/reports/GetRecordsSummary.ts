'use server';

import { apiClient } from '@/api/apiClient';
import { throwIfInvalid } from '@/api/helpers/throwIfInvalid';
import { withAuth } from '@/api/withAuth';
import { z } from 'zod';

const ReqSchema = z.object({
  type: z.number().array().optional(),
  consignorID: z.number().optional(),
  status: z.number().array().optional(),
  startAt: z.date().optional(),
  endAt: z.date().optional(),
});

export interface RecordSummary {
  totalJpyWithdrawal: number;
  totalWithdrawal: number;
  totalWithdrawalTransferFee: number;
  totalClosedPrice: number;
  totalPrice: number;
  totalDirectPurchasePrice: number;
  totalPurchasedPrice: number;
  totalYahooAuctionFeeJpy: number;
  totalYahooAuctionFee: number;
  totalCommission: number;
  totalBonus: number;
  totalProfit: number;
  totalShippingCostsWithinJapan: number;
  totalInternationalShippingCosts: number;
  totalYahooCancellationFeeJpy: number;
  totalYahooCancellationFee: number;
  totalSpaceFeeJpy: number;
  totalSpaceFee: number;
  totalShippingCost: number;
}

type Data = RecordSummary;

type ErrorCode = never;

export async function GetRecordsSummary(payload: z.input<typeof ReqSchema>) {
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

  const res = await withAuth(apiClient)<Data, ErrorCode>(`/reports/records/summary?${query}`, {
    method: 'GET',
    next: {
      tags: ['records'],
    },
  });

  return res;
}
