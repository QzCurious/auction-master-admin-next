'use server';

import { apiClient } from '@/api/apiClient';
import { withAuth } from '@/api/withAuth';

export interface Role {
  role: string;
  description: string;
}

type Data = Array<Role>;

type ErrorCode = never;

export async function roles() {
  const res = await withAuth(apiClient)<Data, ErrorCode>('/roles', {
    method: 'GET',
    next: {
      tags: ['roles'],
    },
  });

  return res;
}
