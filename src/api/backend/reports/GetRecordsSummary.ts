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

export interface Report {
  totalClosedPrice: number;
  totalPrice: number;
  totalDirectPurchasePrice: number;
  totalPurchasedPrice: number;
  totalYahooFee: number;
  totalCommission: number;
  totalBonus: number;
  totalProfit: number;
  totalYahooCancellationFee: number;
  totalSpaceFee: number;
  totalShippingCost: number;
}

export interface Reports {
  JPY?: Report;
  TWD?: Report;
}

type Data = Reports;

type ErrorCode = never;

const EMPTY_REPORT: Report = {
  totalClosedPrice: 0,
  totalPrice: 0,
  totalDirectPurchasePrice: 0,
  totalPurchasedPrice: 0,
  totalYahooFee: 0,
  totalCommission: 0,
  totalBonus: 0,
  totalProfit: 0,
  totalYahooCancellationFee: 0,
  totalSpaceFee: 0,
  totalShippingCost: 0,
};

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
      tags: ['/reports/records/summary'],
    },
  });

  if (!res.error) {
    return {
      ...res,
      data: {
        JPY: res.data.JPY ?? EMPTY_REPORT,
        TWD: res.data.TWD ?? EMPTY_REPORT,
      },
    };
  }

  return res;
}
