'use server';

import * as endpoint from '@/api/backend/shippings/Shipped';
import { createActionApi } from '@/server/next/createActionApi';
import { createApiErrorServerSide } from '@/server/next/createApiErrorServerSide';
import { revalidateMutation } from '@/server/next/revalidateMutation';

export async function Shipped(
  id: Parameters<typeof endpoint.Shipped>[1],
  payload: Parameters<typeof endpoint.Shipped>[2]
) {
  const res = await endpoint.Shipped(createActionApi(), id, payload).catch(createApiErrorServerSide);
  if (!res.error) revalidateMutation('Shipped');
  return res;
}
