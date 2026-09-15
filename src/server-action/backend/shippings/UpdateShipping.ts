'use server';

import * as endpoint from '@/api/backend/shippings/UpdateShipping';
import { createActionApi } from '@/server/next/createActionApi';
import { createApiErrorServerSide } from '@/server/next/createApiErrorServerSide';
import { revalidateMutation } from '@/server/next/revalidateMutation';

export async function UpdateShipping(
  id: Parameters<typeof endpoint.UpdateShipping>[1],
  payload: Parameters<typeof endpoint.UpdateShipping>[2]
) {
  const res = await endpoint.UpdateShipping(createActionApi(), id, payload).catch(createApiErrorServerSide);
  if (!res.error) revalidateMutation('UpdateShipping');
  return res;
}
