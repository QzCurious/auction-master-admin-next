'use server';

import { apiClientBase } from './core/apiClientBase';
import { createApiErrorServerSide } from './core/ApiError/createApiErrorServerSide';
import { type SuccessResponseJson } from './core/static';

export interface Configs {
  yahooAuctionFeeRate: number;
  commissionRate: number;
  defaultCommissionBonusRate: number;
  auctionItemCancellationFee: number;
  costPerSpace: number;
  conpanyConsignorId: number;
  lineURL: string;
  withdrawalTransferFee: number;
  bankName: string;
  bankCode: string;
  bankAccount: string;
  packageThreshold: number;
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

export async function GetConfigs() {
  const res = await apiClientBase
    .get<SuccessResponseJson<Data>>('configs', {
      next: {
        tags: ['config'],
      },
    })
    .json()
    .catch(createApiErrorServerSide);

  return res;
}
