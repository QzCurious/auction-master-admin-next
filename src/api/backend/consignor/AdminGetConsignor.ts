'use server';

import { type CONSIGNOR_STATUS } from '@/domain/static/static-config-mappers';

import { apiClient } from '../../apiClient';
import { withAuth } from '../../withAuth';

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
  bankCode: string;
  bankAccount: string;
  status: CONSIGNOR_STATUS['value'];
  createdAt: string;
  updatedAt: string;
  walletBalance: number;
  bonusBalance: number;
}

interface Data extends Consignor {}

type ErrorCode = never;

export async function AdminGetConsignor(id: number) {
  const res = await withAuth(apiClient)<Data, ErrorCode>(`/consignors/${id}`, {
    method: 'GET',
    next: { tags: ['consignors'] },
  });

  return res;
}
