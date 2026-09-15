'use server';

import { revalidateTag } from 'next/cache';
import { createApiErrorServerSide } from '@/api/core/ApiError/createApiErrorServerSide';
import * as endpoint from '@/api/endpoints/admins/DeleteRoleForAdmin';
import { createActionApi } from '@/server/next/createActionApi';

export async function DeleteRoleForAdmin(
  account: Parameters<typeof endpoint.DeleteRoleForAdmin>[1],
  payload: Parameters<typeof endpoint.DeleteRoleForAdmin>[2]
) {
  const res = await endpoint.DeleteRoleForAdmin(createActionApi(), account, payload).catch(createApiErrorServerSide);
  revalidateTag('admins');
  return res;
}
