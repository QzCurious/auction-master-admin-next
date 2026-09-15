'use server';

import { revalidateTag } from 'next/cache';
import * as endpoint from '@/api/backend/rbac/DeletePermissionForRole';
import { createActionApi } from '@/server/next/createActionApi';
import { createApiErrorServerSide } from '@/server/next/createApiErrorServerSide';

export async function DeletePermissionForRole(payload: Parameters<typeof endpoint.DeletePermissionForRole>[1]) {
  const res = await endpoint.DeletePermissionForRole(createActionApi(), payload).catch(createApiErrorServerSide);
  revalidateTag('roles');
  revalidateTag('admins');
  return res;
}
