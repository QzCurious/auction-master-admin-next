import { type SuccessResponseJson } from '@/api/core/static';
import { type KyInstance } from 'ky';

export interface Role {
  role: string;
  description: string;
}

type Data = Array<Role>;

export async function GetRoles(api: KyInstance) {
  const res = await api.get<SuccessResponseJson<Data>>('backend/roles', {}).json();
  return res;
}
