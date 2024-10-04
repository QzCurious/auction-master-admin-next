'use server';

import { type ACTION_TYPE, type SHIPMENT_TYPE, type SHIPPING_STATUS } from '@/domain/static/static-config-mappers';

import { apiClient } from '../../apiClient';
import { withAuth } from '../../withAuth';

export interface Shipping {
  id: string;
  actionType: ACTION_TYPE['value'];
  shipmentType: SHIPMENT_TYPE['value'];
  itemIDs: Array<number>;
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

type ErrorCode = never;

export async function GetShipping(id: Shipping['id']) {
  const res = await withAuth(apiClient)<Data, ErrorCode>(`/backend/shippings/${id}`, {
    method: 'GET',
    next: { tags: ['shippings'] },
  });

  return res;
}
