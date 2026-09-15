'use server';

import { revalidateTag } from 'next/cache';
import * as endpoint from '@/api/backend/rbac/DeleteRole';
import { createActionApi } from '@/server/next/createActionApi';
import { createApiErrorServerSide } from '@/server/next/createApiErrorServerSide';

export async function DeleteRole(role: Parameters<typeof endpoint.DeleteRole>[1]) {
  const res = await endpoint.DeleteRole(createActionApi(), role).catch(createApiErrorServerSide);
  revalidateTag('roles');
  return res;
}
