'use server';

import { apiClient } from '@/api/apiClient';
import { withAuth } from '@/api/withAuth';

export interface Configs {
  yahooAuctionFeeRate: number;
  commissionRate: number;
  defaultCommissionBonusRate: number;
  auctionItemCancellationFee: number;
  costPerSpace: number;
  lineURL: string;
  shippingInfo: {
    company: {
      address: string;
      recipientName: string;
      phone: string;
    };
    sevenEleven: {
      storeNumber: string;
      storeName: string;
      recipientName: string;
      phone: string;
    };
    family: {
      storeNumber: string;
      storeName: string;
      recipientName: string;
      phone: string;
    };
  };
}

interface Data extends Configs {}

type ErrorCode = never;

export async function GetConfigs() {
  const res = await withAuth(apiClient)<Data, ErrorCode>('/configs', {
    method: 'GET',
    next: {
      tags: ['config'],
    },
  });

  return res;
}
