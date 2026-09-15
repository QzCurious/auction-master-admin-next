'use server';

import * as endpoint from '@/api/backend/consignor/AdminUpdateConsignor';
import { createActionApi } from '@/server/next/createActionApi';
import { createApiErrorServerSide } from '@/server/next/createApiErrorServerSide';
import { revalidateMutation } from '@/server/next/revalidateMutation';

export async function AdminUpdateConsignor(
  id: Parameters<typeof endpoint.AdminUpdateConsignor>[1],
  payload: Parameters<typeof endpoint.AdminUpdateConsignor>[2]
) {
  const res = await endpoint.AdminUpdateConsignor(createActionApi(), id, payload).catch(createApiErrorServerSide);
  if (!res.error) revalidateMutation('AdminUpdateConsignor');
  return res;
}
