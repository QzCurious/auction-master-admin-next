import { type SuccessResponseJson } from '@/api/core/static';
import { type Shipping } from '@/api/endpoints/shippings/GetShippings';
import { type KyInstance } from 'ky';

type Data = 'Success';

export async function ProcessingShipping(api: KyInstance, id: Shipping['id']) {
  const res = await api.post<SuccessResponseJson<Data>>(`backend/shippings/${id}/processing`).json();
  return res;
}
