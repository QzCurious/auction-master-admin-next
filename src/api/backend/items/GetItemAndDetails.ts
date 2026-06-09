'use server';

import { apiClientWithToken } from '@/api/core/apiClientWithToken';
import { createApiErrorServerSide } from '@/api/core/ApiError/createApiErrorServerSide';
import { type SuccessResponseJson } from '@/api/core/static';
import { type ITEM_STATUS, type ITEM_TYPE } from '@/domain/static/static-config-mappers';

export interface Item {
  id: number;
  consignorId: number;
  type: 0 | ITEM_TYPE['value'];
  isNew: boolean;
  name: string;
  description: string;
  directPurchasePrice: number;
  minEstimatedPrice: number;
  maxEstimatedPrice: number;
  reservePrice: number;
  expireAt?: string;
  warehouseId: string;
  space: number;
  shippingCostsWithinJapan: number;
  grossWeight: number;
  volumetricWeight: number;
  status: ITEM_STATUS['value'];
  createdAt: string;
  updatedAt: string;
  nickname: string;
  photos: Array<{
    sorted: number;
    photo: string;
    createdAt: string;
    updatedAt: string;
  }>;
  pastStatuses?: { [k in ITEM_STATUS['value']]?: string };
  auctionId?: number;
  recordId?: string;
}

interface Data extends Item {}

export async function GetItemAndDetails(id: number) {
  const res = await apiClientWithToken
    .get<SuccessResponseJson<Data>>(`backend/items/${id}`, {
      next: { tags: ['items'] },
    })
    .json()
    .catch(createApiErrorServerSide);

  return res;
}
