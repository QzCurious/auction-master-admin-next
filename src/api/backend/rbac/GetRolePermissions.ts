import { apiClient } from '@/api/apiClient';
import { withAuth } from '@/api/withAuth';

import { type Permission } from './GetPermissions';
import { type Role } from './GetRoles';

export interface RolePermissions {
  description: string;
  permission: Permission[];
}

type Data = RolePermissions;

type ErrorCode = never;

export async function GetRolePermissions(role: Role['role']) {
  const res = await withAuth(apiClient)<Data, ErrorCode>(`/backend/roles/${role}/permissions`, {
    method: 'GET',
    next: {
      tags: ['roles'],
    },
  });

  return res;
}
