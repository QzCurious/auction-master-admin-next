'use server';

import { revalidateTag } from 'next/cache';
import { apiClient } from '@/api/apiClient';
import { withAuth } from '@/api/withAuth';

type Data = 'Success';

type ErrorCode = never;

export async function DeleteAdmin(id: number) {
  const res = await withAuth(apiClient)<Data, ErrorCode>(`/admins/${id}`, {
    method: 'DELETE',
  });

  revalidateTag('admins');

  return res;
}
