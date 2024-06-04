import { apiClient } from '@/api/apiClient';
import { handleAuth } from '@/api/withAuth';

export interface Permission {
  key: string;
  method: 'GET' | 'POST' | 'PUT' | 'DELETE' | 'PATCH';
  url: string;
  description: string;
}

type Data = Array<Permission>;

type ErrorCode = never;

export async function permissions() {
  const res = await handleAuth(apiClient)<Data, ErrorCode>('/permissions', {
    method: 'GET',
  });

  return res;
}
