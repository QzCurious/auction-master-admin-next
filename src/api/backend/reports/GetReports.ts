'use server';

import { apiClient } from '@/api/apiClient';
import { throwIfInvalid } from '@/api/helpers/throwIfInvalid';
import { withAuth } from '@/api/withAuth';
import { z } from 'zod';

const ReqSchema = z.object({
  startAt: z.coerce.date().nullish(),
  endAt: z.coerce.date().nullish(),
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

type Data = Array<{
  id: string;
  reports: Reports;
  reportAt: string;
  createdAt: string;
}> | null;

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

export async function GetReports(payload: z.input<typeof ReqSchema>) {
  const data = throwIfInvalid(payload, ReqSchema);

  const query = new URLSearchParams();
  data.startAt && query.append('startAt', data.startAt.toISOString());
  data.endAt && query.append('endAt', data.endAt.toISOString());

  const res = await withAuth(apiClient)<Data, ErrorCode>(`/reports?${query}`, {
    method: 'GET',
    next: {
      tags: ['reports'],
    },
  });

  if (!res.error) {
    return {
      ...res,
      data:
        res.data?.map((report) => ({
          ...report,
          reports: {
            JPY: report.reports.JPY ?? EMPTY_REPORT,
            TWD: report.reports.TWD ?? EMPTY_REPORT,
          },
        })) ?? [],
    };
  }

  return res;
}
