'use server';

import { apiClient } from '@/api/apiClient';
import { withAuth } from '@/api/withAuth';
import { revalidateTag } from 'next/cache';

export interface Role {
  role: string;
  description: string;
}

type Data = 'Success';

type ErrorCode = never;

export async function deleteRole(role: string) {
  const res = await withAuth(apiClient)<Data, ErrorCode>(`/roles/${role}`, {
    method: 'DELETE',
  });
  revalidateTag('roles');

  return res;
}
