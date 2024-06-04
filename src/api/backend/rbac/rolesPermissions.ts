import { apiClient } from '@/api/apiClient';
import { handleAuth } from '@/api/withAuth';

import { type Permission } from './permissions';
import { type Role } from './roles';

export type RolePermissions = Role & {
  permission: Permission[];
};

type Data = Array<RolePermissions>;

type ErrorCode = never;

export async function rolesPermissions() {
  const res = await handleAuth(apiClient)<Data, ErrorCode>('/roles/permissions', {
    method: 'GET',
  });

  return res;
}
