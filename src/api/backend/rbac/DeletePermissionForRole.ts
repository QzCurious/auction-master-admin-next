'use server';

import { revalidateTag } from 'next/cache';
import { createApiErrorServerSide } from '@/api/core/ApiError/createApiErrorServerSide';
import * as endpoint from '@/api/endpoints/rbac/DeletePermissionForRole';
import { createActionApi } from '@/server/next/createActionApi';

export async function DeletePermissionForRole(payload: Parameters<typeof endpoint.DeletePermissionForRole>[1]) {
  const res = await endpoint.DeletePermissionForRole(createActionApi(), payload).catch(createApiErrorServerSide);
  revalidateTag('roles');
  return res;
}
