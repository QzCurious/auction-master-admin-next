import { apiClient } from '@/api/apiClient';
import { withAuth } from '@/api/withAuth';

import { type Permission } from './GetPermissions';
import { type Role } from './GetRoles';

export type RolePermissions = Role & {
  permission: Permission[];
};

type Data = Array<RolePermissions>;

type ErrorCode = never;

export async function GetRolesPermission() {
  const res = await withAuth(apiClient)<Data, ErrorCode>('/roles/permissions', {
    method: 'GET',
    next: {
      tags: ['roles'],
    }
  });

  return res;
}
