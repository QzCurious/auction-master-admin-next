'use server';

import { revalidateTag } from 'next/cache';
import * as endpoint from '@/api/backend/admins/AddRoleForAdmin';
import { createActionApi } from '@/server/next/createActionApi';
import { createApiErrorServerSide } from '@/server/next/createApiErrorServerSide';

export async function AddRoleForAdmin(
  account: Parameters<typeof endpoint.AddRoleForAdmin>[1],
  payload: Parameters<typeof endpoint.AddRoleForAdmin>[2]
) {
  const res = await endpoint.AddRoleForAdmin(createActionApi(), account, payload).catch(createApiErrorServerSide);
  revalidateTag('admins');
  return res;
}
