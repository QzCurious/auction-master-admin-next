import { throwIfInvalid, type SuccessResponseJson } from '@/api/core/static';
import { appendEntries } from '@/domain/crud/appendEntries';
import { type KyInstance } from 'ky';
import { z } from 'zod';

const ReqSchema = z.object({
  type: z.number().array().optional(),
  consignorId: z.number().optional(),
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

export async function GetRecordsSummary(api: KyInstance, payload: z.input<typeof ReqSchema>) {
  const data = throwIfInvalid(payload, ReqSchema);

  const query = new URLSearchParams();
  appendEntries(query, data);

  const res = await api.get<SuccessResponseJson<Data>>(`backend/reports/records/summary?${query}`, {}).json();
  return res;
}
