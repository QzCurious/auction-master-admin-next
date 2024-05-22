import { apiClient } from '@/api/apiClient';
import { withAuth } from '@/api/withAuth';

export interface Permission {
  id: number;
  method: 'GET' | 'POST' | 'PUT' | 'DELETE' | 'PATCH';
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
