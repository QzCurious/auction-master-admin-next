import { type Role } from '@/api/backend/rbac/GetRoles';
import { type SuccessResponseJson } from '@/api/core/static';
import { type ADMIN_STATUS } from '@/domain/static/static-config-mappers';
import { type KyInstance } from 'ky';

export interface Admin {
  id: number;
  account: string;
  password: string;
  status: ADMIN_STATUS['value'];
  createdAt: string;
  updatedAt: string;
  roles: Array<Role['role']>;
}

interface Data extends Admin {}

export async function GetAdmin(api: KyInstance, id: number) {
  const res = await api.get<SuccessResponseJson<Data>>(`backend/admins/${id}`, {}).json();
  return res;
}
