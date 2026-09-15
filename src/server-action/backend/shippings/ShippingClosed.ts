'use server';

import * as endpoint from '@/api/backend/shippings/ShippingClosed';
import { createActionApi } from '@/server/next/createActionApi';
import { createApiErrorServerSide } from '@/server/next/createApiErrorServerSide';
import { revalidateMutation } from '@/server/next/revalidateMutation';

export async function ShippingClosed(
  id: Parameters<typeof endpoint.ShippingClosed>[1],
  payload: Parameters<typeof endpoint.ShippingClosed>[2]
) {
  const res = await endpoint.ShippingClosed(createActionApi(), id, payload).catch(createApiErrorServerSide);
  if (!res.error) revalidateMutation('ShippingClosed');
  return res;
}
