'use server';

import { revalidateTag } from 'next/cache';
import { createApiErrorServerSide } from '@/api/core/ApiError/createApiErrorServerSide';
import * as endpoint from '@/api/endpoints/rbac/DeleteRole';
import { createActionApi } from '@/server/next/createActionApi';

export async function DeleteRole(role: Parameters<typeof endpoint.DeleteRole>[1]) {
  const res = await endpoint.DeleteRole(createActionApi(), role).catch(createApiErrorServerSide);
  revalidateTag('roles');
  return res;
}
