import { apiClient } from '@/api/apiClient';
import { withAuth } from '@/api/withAuth';
import { type PermissionKey } from '@/domain/permission/types';

export interface Permission {
  key: PermissionKey;
  url: string;
  method: string;
  fields: Array<string>;
  description: string;
}

export interface PermissionGroup {
  message: string;
  permissions: Array<Permission>;
}

type Data = Array<PermissionGroup>;

type ErrorCode = never;

export async function GetPermissions() {
  const res = await withAuth(apiClient)<Data, ErrorCode>('/backend/permissions', {
    method: 'GET',
  });

  return res;
}
