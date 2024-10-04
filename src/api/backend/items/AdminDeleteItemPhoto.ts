'use server';

import { revalidateTag } from 'next/cache';

import { apiClient } from '../../apiClient';
import { withAuth } from '../../withAuth';

type Data = 'Success';

type ErrorCode = never;

export async function AdminDeleteItemPhoto(id: number, sorted: number) {
  const res = await withAuth(apiClient)<Data, ErrorCode>(`/backend/items/${id}/photos/${sorted}`, {
    method: 'DELETE',
  });

  revalidateTag('items');

  return res;
}
