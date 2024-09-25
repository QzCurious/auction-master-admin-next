'use server';

import { revalidateTag } from 'next/cache';
import { apiClient } from '@/api/apiClient';
import { withAuth } from '@/api/withAuth';

import { type Shipping } from './GetShippings';

type Data = 'Success';

type ErrorCode = never;

export async function ShippingClosed(id: Shipping['id']) {
  const res = await withAuth(apiClient)<Data, ErrorCode>(`/backend/shippings/${id}/closed`, {
    method: 'POST',
  });

  revalidateTag('shippings');

  return res;
}
