import { type SuccessResponseJson } from '@/api/core/static';
import { type KyInstance } from 'ky';

type Data = 'Success';

export async function DeleteAdmin(api: KyInstance, id: number) {
  const res = await api.delete<SuccessResponseJson<Data>>(`backend/admins/${id}`, {}).json();
  return res;
}
