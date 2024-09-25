'use server';

import { revalidateTag } from 'next/cache';

import { apiClient } from '../../apiClient';
import { withAuth } from '../../withAuth';

type Data = 'Success';

type ErrorCode = never;

export async function ItemWarehousePersonnelConfirmed(id: number) {
  const res = await withAuth(apiClient)<Data, ErrorCode>(`/backend/items/${id}/warehouse-personnel-confirmed`, {
    method: 'POST',
  });

  revalidateTag('items');

  return res;
}
