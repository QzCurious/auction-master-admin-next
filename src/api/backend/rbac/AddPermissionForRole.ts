'use server';

import { revalidateTag } from 'next/cache';
import { createApiErrorServerSide } from '@/api/core/ApiError/createApiErrorServerSide';
import * as endpoint from '@/api/endpoints/rbac/AddPermissionForRole';
import { createActionApi } from '@/server/next/createActionApi';

export async function AddPermissionForRole(payload: Parameters<typeof endpoint.AddPermissionForRole>[1]) {
  const res = await endpoint.AddPermissionForRole(createActionApi(), payload).catch(createApiErrorServerSide);
  revalidateTag('roles');
  return res;
}
