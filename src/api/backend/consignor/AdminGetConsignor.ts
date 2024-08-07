'use server';

import { apiClient } from '../../apiClient';
import { withAuth } from '../../withAuth';
import { type CONSIGNOR_STATUS } from '../configs.data';

export interface Consignor {
  id: number;
  account: string;
  password: string;
  nickname: string;
  name: string;
  identification: string;
  phone: string;
  bankCode: string;
  bankAccount: string;
  status: CONSIGNOR_STATUS['value'];
  createdAt: string;
  updatedAt: string;
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
