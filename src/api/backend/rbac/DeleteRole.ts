import { type SuccessResponseJson } from '@/api/core/static';
import { type KyInstance } from 'ky';

type Data = 'Success';

export async function DeleteRole(api: KyInstance, role: string) {
  const res = await api.delete<SuccessResponseJson<Data>>(`backend/roles/${role}`).json();
  return res;
}
