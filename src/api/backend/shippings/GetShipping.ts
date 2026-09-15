import { type SuccessResponseJson } from '@/api/core/static';
import { type ACTION_TYPE, type SHIPMENT_TYPE, type SHIPPING_STATUS } from '@/domain/static/static-config-mappers';
import { type KyInstance } from 'ky';

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

export async function GetShipping(api: KyInstance, id: Shipping['id']) {
  const res = await api.get<SuccessResponseJson<Data>>(`backend/shippings/${id}`, {}).json();
  return res;
}
