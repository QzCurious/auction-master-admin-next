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
  withdrawalTransferFee: number;
  bankName: string;
  bankCode: string;
  bankAccount: string;
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

// eslint-disable-next-line no-lone-blocks
{
  // eslint-disable-next-line no-lone-blocks
  {
    const s = (
      new URL('https://line.me/R/ti/p/@qij2136z?oat_content=url&ts=06231825').pathname.match(/@.*$/g)
    );
    console.log(s);
  }
}
