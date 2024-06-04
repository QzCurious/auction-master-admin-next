'use server';

import { apiClient } from '@/api/apiClient';
import { handleAuth } from '@/api/withAuth';

export interface Admin {
  id: number;
  account: string;
  roles: string[];
  password: string;
  status: number;
  createdAt: string;
  updatedAt: string;
}

interface Data extends Admin {}

type ErrorCode = never;

export async function getAdmin(id: number) {
  const res = await handleAuth(apiClient)<Data, ErrorCode>(`/admins/${id}`, {
    method: 'GET',
    next: {
      tags: ['admins'],
    },
  });

  return res;
}
