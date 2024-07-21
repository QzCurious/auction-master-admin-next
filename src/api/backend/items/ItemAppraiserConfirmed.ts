'use server';

import { revalidateTag } from 'next/cache';

import { apiClient } from '../../apiClient';
import { withAuth } from '../../withAuth';

type Data = 'Success';

type ErrorCode = never;

export async function ItemAppraiserConfirmed(id: number) {
  const res = await withAuth(apiClient)<Data, ErrorCode>(`/items/${id}/appraiser-confirmed`, {
    method: 'POST',
  });

  revalidateTag('items');

  return res;
}
