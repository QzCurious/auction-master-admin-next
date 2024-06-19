import { apiClient } from '@/api/apiClient';
import { withAuth } from '@/api/withAuth';

import { type CONFIGS_DATA } from './configs.data';

export interface Configs {
  yahooAuctionFeeRate: number;
  commissionRate: number;
  commissionBonusRate: number;
  itemType: Array<{
    key: (typeof CONFIGS_DATA)['itemType'][number]['key'];
    message: string;
    value: number;
  }>;
  itemStatus: Array<{
    key: (typeof CONFIGS_DATA)['itemStatus'][number]['key'];
    message: string;
    value: number;
  }>;
  auctionItemStatus: Array<{
    key: (typeof CONFIGS_DATA)['auctionItemStatus'][number]['key'];
    message: string;
    value: number;
  }>;
  consignorStatus: Array<{
    message: (typeof CONFIGS_DATA)['consignorStatus'][number]['message'];
    value: number;
  }>;
  consignorVerificationStatus: Array<{
    message: (typeof CONFIGS_DATA)['consignorVerificationStatus'][number]['message'];
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

interface Data extends Configs {}

type ErrorCode = never;

export async function configs() {
  'use server';

  const res = await withAuth(apiClient)<Data, ErrorCode>('/configs', {
    method: 'GET',
    next: {
      tags: ['config'],
    },
  });

  return res;
}
