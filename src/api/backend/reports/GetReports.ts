import { throwIfInvalid, type SuccessResponseJson } from '@/api/core/static';
import { appendEntries } from '@/domain/crud/appendEntries';
import { type KyInstance } from 'ky';
import { z } from 'zod';

const ReqSchema = z.object({
  startAt: z.coerce.date().nullish(),
  endAt: z.coerce.date().nullish(),
});

export interface Report {
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

type Data = Array<{
  id: string;
  reports: Report;
  reportAt: string;
  createdAt: string;
}>;

type ErrorCode = never;

export async function GetReports(api: KyInstance, payload: z.input<typeof ReqSchema>) {
  const data = throwIfInvalid(payload, ReqSchema);

  const query = new URLSearchParams();
  appendEntries(query, data);

  const res = await api.get<SuccessResponseJson<Data>>(`backend/reports?${query}`, {}).json();
  return res;
}
