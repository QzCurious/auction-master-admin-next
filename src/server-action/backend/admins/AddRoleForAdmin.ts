'use server';

import * as endpoint from '@/api/backend/admins/AddRoleForAdmin';
import { createActionApi } from '@/server/next/createActionApi';
import { createApiErrorServerSide } from '@/server/next/createApiErrorServerSide';
import { revalidateMutation } from '@/server/next/revalidateMutation';

export async function AddRoleForAdmin(
  account: Parameters<typeof endpoint.AddRoleForAdmin>[1],
  payload: Parameters<typeof endpoint.AddRoleForAdmin>[2]
) {
  const res = await endpoint.AddRoleForAdmin(createActionApi(), account, payload).catch(createApiErrorServerSide);
  if (!res.error) revalidateMutation('AddRoleForAdmin');
  return res;
}
