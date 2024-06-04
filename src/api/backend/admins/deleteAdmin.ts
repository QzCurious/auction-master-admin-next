'use server';

import { revalidateTag } from 'next/cache';
import { apiClient } from '@/api/apiClient';
import { handleAuth } from '@/api/withAuth';

type Data = 'Success';

type ErrorCode = never;

export async function deleteAdmin(id: number) {
  const res = await handleAuth(apiClient)<Data, ErrorCode>(`/admins/${id}`, {
    method: 'DELETE',
  });

  revalidateTag('admins');

  return res;
}
