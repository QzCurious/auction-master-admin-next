import { apiClient } from '@/api/apiClient';
import { withAuth } from '@/api/withAuth';

import { type CONFIGS_DATA } from './configs.data';

export interface Configs {
  yahooAuctionFeeRate: number;
  commissionRate: number;
  commissionBonusRate: number;
  lineURL: string;
  shippingInfo: {
    company: {
      address: string
      recipientName: string
      phone: string
    };
    sevenEleven: {
      storeNumber: string
      storeName: string
      recipientName: string
      phone: string
    };
    family: {
      storeNumber: string
      storeName: string
      recipientName: string
      phone: string
    };
  };
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
    key: (typeof CONFIGS_DATA)['consignorStatus'][number]['key'];
    message: string;
    value: number;
  }>;
  consignorVerificationStatus: Array<{
    key: (typeof CONFIGS_DATA)['consignorVerificationStatus'][number]['key'];
    message: string;
    value: number;
  }>;
  workerType: Array<{
    key: (typeof CONFIGS_DATA)['workerType'][number]['key'];
    message: string;
    value: string;
  }>;
  adminStatus: Array<{
    key: (typeof CONFIGS_DATA)['adminStatus'][number]['key'];
    message: string;
    value: number;
  }>;
}

interface Data extends Configs {}

type ErrorCode = never;

export async function GetBackendConfigs() {
  'use server';

  const res = await withAuth(apiClient)<Data, ErrorCode>('/configs', {
    method: 'GET',
    next: {
      tags: ['config'],
    },
  });

  return res;
}
