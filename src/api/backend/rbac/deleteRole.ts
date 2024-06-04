'use server';

import { revalidateTag } from 'next/cache';
import { apiClient } from '@/api/apiClient';
import { handleAuth } from '@/api/withAuth';

type Data = 'Success';

type ErrorCode = never;

export async function deleteRole(role: string) {
  const res = await handleAuth(apiClient)<Data, ErrorCode>(`/roles/${role}`, {
    method: 'DELETE',
  });

  revalidateTag('roles');

  return res;
}
