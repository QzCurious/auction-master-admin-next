import { type SuccessResponseJson } from '@/api/core/static';
import { type KyInstance } from 'ky';

type Data = 'Success';

export async function AdminDeleteItemPhoto(api: KyInstance, id: number, sorted: number) {
  const res = await api.delete<SuccessResponseJson<Data>>(`backend/items/${id}/photos/${sorted}`).json();
  return res;
}
