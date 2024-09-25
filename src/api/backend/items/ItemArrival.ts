'use server';

import { revalidateTag } from 'next/cache';

import { apiClient } from '../../apiClient';
import { withAuth } from '../../withAuth';

type Data = 'Success';

type ErrorCode = never;

export async function ItemArrival(id: number) {
  const res = await withAuth(apiClient)<Data, ErrorCode>(`/backend/items/${id}/arrival`, {
    method: 'POST',
  });

  revalidateTag('items');

  return res;
}
