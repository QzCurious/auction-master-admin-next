'use server';

import * as endpoint from '@/api/backend/admins/UpdateAdmin';
import { createActionApi } from '@/server/next/createActionApi';
import { createApiErrorServerSide } from '@/server/next/createApiErrorServerSide';
import { revalidateMutation } from '@/server/next/revalidateMutation';

export async function UpdateAdmin(
  id: Parameters<typeof endpoint.UpdateAdmin>[1],
  payload: Parameters<typeof endpoint.UpdateAdmin>[2]
) {
  const res = await endpoint.UpdateAdmin(createActionApi(), id, payload).catch(createApiErrorServerSide);
  if (!res.error) revalidateMutation('UpdateAdmin');
  return res;
}
