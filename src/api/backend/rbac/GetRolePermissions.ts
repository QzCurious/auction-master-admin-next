import { apiClientWithToken } from '@/api/core/apiClientWithToken';
import { createApiErrorServerSide } from '@/api/core/ApiError/createApiErrorServerSide';
import { type SuccessResponseJson } from '@/api/core/static';

import { type Permission } from './GetPermissions';
import { type Role } from './GetRoles';

export interface RolePermissions {
  description: string;
  permission: Permission[];
}

type Data = RolePermissions;

export async function GetRolePermissions(role: Role['role']) {
  const res = await apiClientWithToken
    .get<SuccessResponseJson<Data>>(`backend/roles/${role}/permissions`, {
      next: {
        tags: ['roles'],
      },
    })
    .json()
    .catch(createApiErrorServerSide);

  return res;
}
