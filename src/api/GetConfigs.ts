import { type SuccessResponseJson } from '@/api/core/static';
import { type KyInstance } from 'ky';

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

export async function GetConfigs(api: KyInstance) {
  const res = await api.get<SuccessResponseJson<Data>>('configs', {}).json();
  return res;
}
