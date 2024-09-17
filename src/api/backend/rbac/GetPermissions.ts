import { apiClient } from '@/api/apiClient';
import { withAuth } from '@/api/withAuth';

import { type PermissionKey } from './permissions.data';

export interface Permission {
  key: PermissionKey;
  url: string;
  method: string;
  fields: Array<string>;
  description: string;
}

type Data = Array<{
  message: string;
  permissions: Array<Permission>;
}>;

type ErrorCode = never;

export async function GetPermissions() {
  const res = await withAuth(apiClient)<Data, ErrorCode>('/permissions', {
    method: 'GET',
  });

  return res;
}
