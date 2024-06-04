import { apiClient } from '@/api/apiClient';
import { handleAuth } from '@/api/withAuth';

export interface Data {
  yahooAuctionFeeRate: number;
  commissionRate: number;
  commissionBonusRate: number;
  itemType: Array<{
    key: string;
    message: string;
    value: number;
  }>;
  itemStatus: Array<{
    key: string;
    message: string;
    value: number;
  }>;
  auctionItemStatus: Array<{
    key: string;
    message: string;
    value: number;
  }>;
  consignorStatus: Array<{
    message: string;
    value: number;
  }>;
  consignorVerificationStatus: Array<{
    message: string;
    value: number;
  }>;
  shippingInfo: string;
  workerType: Array<{
    message: string;
    value: string;
  }>;
  adminStatus: Array<{
    message: string;
    value: number;
  }>;
}

type ErrorCode = never;

export async function configs() {
  'use server';

  const res = await handleAuth(apiClient)<Data, ErrorCode>('/configs', {
    method: 'GET',
    next: {
      tags: ['config'],
    },
  });

  return res;
}
