import { type SuccessResponseJson } from '@/api/core/static';
import { type KyInstance } from 'ky';

interface Data {
  buying: number;
  selling: number;
}

export async function GetJPYRates(api: KyInstance) {
  const res = await api.get<SuccessResponseJson<Data>>('/backend/jpy-rates', {}).json();
  return res;
}
