import { type SuccessResponseJson } from '@/api/core/static';
import { type CONSIGNOR_STATUS } from '@/domain/static/static-config-mappers';
import { type KyInstance } from 'ky';

export interface Consignor {
  id: number;
  avatar: string;
  account: string;
  password: string;
  nickname: string;
  commissionBonusRate: number;
  name: string;
  identification: string;
  gender: 1 | 2;
  birthday: string;
  city: string;
  district: string;
  streetAddress: string;
  phone: string;
  beneficiaryName: string | null;
  bankCode: string;
  bankAccount: string;
  status: CONSIGNOR_STATUS['value'];
  createdAt: string;
  updatedAt: string;
  walletBalance: number;
  bonusBalance: number;
}

interface Data extends Consignor {}

export async function AdminGetConsignor(api: KyInstance, id: number) {
  const res = await api.get<SuccessResponseJson<Data>>(`backend/consignors/${id}`, {}).json();
  return res;
}
