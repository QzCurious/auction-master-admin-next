import { apiClient } from '@/api/apiClient';
import { withAuth } from '@/api/withAuth';

import { type PERMISSIONS_DATA } from './permissions.data';

export interface Permission {
  key: (typeof PERMISSIONS_DATA)[number]['key'];
  method: string;
  url: string;
  description: string;
}

type Data = Array<Permission>;

type ErrorCode = never;

export async function permissions() {
  const res = await withAuth(apiClient)<Data, ErrorCode>('/permissions', {
    method: 'GET',
  });

  return res;
}
