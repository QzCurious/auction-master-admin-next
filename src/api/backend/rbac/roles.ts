import { apiClient } from '@/api/apiClient';
import { handleAuth } from '@/api/withAuth';

export interface Role {
  role: string;
  description: string;
}

type Data = Array<Role>;

type ErrorCode = never;

export async function roles() {
  'use server';

  const res = await handleAuth(apiClient)<Data, ErrorCode>('/roles', {
    method: 'GET',
    next: {
      tags: ['roles'],
    },
  });

  return res;
}
