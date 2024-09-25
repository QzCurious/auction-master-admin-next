'use server';

import { revalidateTag } from 'next/cache';
import { apiClient } from '@/api/apiClient';
import { withAuth } from '@/api/withAuth';

type Data = 'Success';

type ErrorCode = never;

export async function DeleteRole(role: string) {
  const res = await withAuth(apiClient)<Data, ErrorCode>(`/backend/roles/${role}`, {
    method: 'DELETE',
  });

  revalidateTag('roles');

  return res;
}
