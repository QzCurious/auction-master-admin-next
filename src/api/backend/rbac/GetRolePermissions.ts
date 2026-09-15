import { type Permission } from '@/api/backend/rbac/GetPermissions';
import { type Role } from '@/api/backend/rbac/GetRoles';
import { type SuccessResponseJson } from '@/api/core/static';
import { type KyInstance } from 'ky';

export interface RolePermissions {
  description: string;
  permission: Permission[];
}

type Data = RolePermissions;

export async function GetRolePermissions(api: KyInstance, role: Role['role']) {
  const res = await api.get<SuccessResponseJson<Data>>(`backend/roles/${role}/permissions`, {}).json();
  return res;
}
