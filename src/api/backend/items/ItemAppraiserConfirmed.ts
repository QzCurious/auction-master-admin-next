import { type SuccessResponseJson } from '@/api/core/static';
import { type KyInstance } from 'ky';

type Data = 'Success';

export async function ItemAppraiserConfirmed(api: KyInstance, id: number) {
  const res = await api.post<SuccessResponseJson<Data>>(`backend/items/${id}/appraiser-confirmed`).json();
  return res;
}
