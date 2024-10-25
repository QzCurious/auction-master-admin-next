'use server';

import { apiClientWithToken } from '@/api/core/apiClientWithToken';
import { createApiErrorServerSide } from '@/api/core/ApiError/createApiErrorServerSide';
import { type SuccessResponseJson } from '@/api/core/static';
import { type ACTION_TYPE, type SHIPMENT_TYPE, type SHIPPING_STATUS } from '@/domain/static/static-config-mappers';

export interface Shipping {
  id: string;
  actionType: ACTION_TYPE['value'];
  shipmentType: SHIPMENT_TYPE['value'];
  itemIds: Array<number>;
  auctionIds: Array<string>;
  address: string;
  storeNumber?: string;
  storeName?: string;
  recipientName: string;
  phone: string;
  shipmentTrackingNumber?: string;
  internationalShippingCosts?: number;
  remark?: string;
  status: SHIPPING_STATUS['value'];
  createdAt: string;
  updatedAt: string;
}

type Data = Shipping;

export async function GetShipping(id: Shipping['id']) {
  const res = await apiClientWithToken
    .get<SuccessResponseJson<Data>>(`backend/shippings/${id}`, {
      next: { tags: ['shippings'] },
    })
    .json()
    .catch(createApiErrorServerSide);

  return res;
}
