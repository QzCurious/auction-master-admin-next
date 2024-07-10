import { apiClient } from '@/api/apiClient';
import { withAuth } from '@/api/withAuth';

import { type PermissionKey } from './permissions.data';

export interface Permission {
  key: PermissionKey;
  method: string;
  url: string;
  description: string;
}

type Data = Array<{
  message: string;
  permissions: Array<Permission>;
}>;

type ErrorCode = never;

export async function permissions() {
  const res = await withAuth(apiClient)<Data, ErrorCode>('/permissions', {
    method: 'GET',
  });

  return res;
}
