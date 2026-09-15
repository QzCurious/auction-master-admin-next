'use server';

import * as endpoint from '@/api/backend/admins/DeleteRoleForAdmin';
import { createActionApi } from '@/server/next/createActionApi';
import { createApiErrorServerSide } from '@/server/next/createApiErrorServerSide';
import { revalidateMutation } from '@/server/next/revalidateMutation';

export async function DeleteRoleForAdmin(
  account: Parameters<typeof endpoint.DeleteRoleForAdmin>[1],
  payload: Parameters<typeof endpoint.DeleteRoleForAdmin>[2]
) {
  const res = await endpoint.DeleteRoleForAdmin(createActionApi(), account, payload).catch(createApiErrorServerSide);
  if (!res.error) revalidateMutation('DeleteRoleForAdmin');
  return res;
}
