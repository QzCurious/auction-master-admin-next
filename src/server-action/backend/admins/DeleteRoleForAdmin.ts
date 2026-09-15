'use server';

import { revalidateTag } from 'next/cache';
import * as endpoint from '@/api/backend/admins/DeleteRoleForAdmin';
import { createActionApi } from '@/server/next/createActionApi';
import { createApiErrorServerSide } from '@/server/next/createApiErrorServerSide';

export async function DeleteRoleForAdmin(
  account: Parameters<typeof endpoint.DeleteRoleForAdmin>[1],
  payload: Parameters<typeof endpoint.DeleteRoleForAdmin>[2]
) {
  const res = await endpoint.DeleteRoleForAdmin(createActionApi(), account, payload).catch(createApiErrorServerSide);
  revalidateTag('admins');
  return res;
}
