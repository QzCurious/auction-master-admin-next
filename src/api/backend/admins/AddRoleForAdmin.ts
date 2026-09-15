'use server';

import { revalidateTag } from 'next/cache';
import { createApiErrorServerSide } from '@/api/core/ApiError/createApiErrorServerSide';
import * as endpoint from '@/api/endpoints/admins/AddRoleForAdmin';
import { createActionApi } from '@/server/next/createActionApi';

export async function AddRoleForAdmin(
  account: Parameters<typeof endpoint.AddRoleForAdmin>[1],
  payload: Parameters<typeof endpoint.AddRoleForAdmin>[2]
) {
  const res = await endpoint.AddRoleForAdmin(createActionApi(), account, payload).catch(createApiErrorServerSide);
  revalidateTag('admins');
  return res;
}
