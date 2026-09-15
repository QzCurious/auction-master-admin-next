'use server';

import { revalidateTag } from 'next/cache';
import * as endpoint from '@/api/backend/rbac/AddPermissionForRole';
import { createActionApi } from '@/server/next/createActionApi';
import { createApiErrorServerSide } from '@/server/next/createApiErrorServerSide';

export async function AddPermissionForRole(payload: Parameters<typeof endpoint.AddPermissionForRole>[1]) {
  const res = await endpoint.AddPermissionForRole(createActionApi(), payload).catch(createApiErrorServerSide);
  revalidateTag('roles');
  revalidateTag('admins');
  return res;
}
