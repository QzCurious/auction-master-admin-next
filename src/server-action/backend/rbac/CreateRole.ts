'use server';

import { revalidateTag } from 'next/cache';
import * as endpoint from '@/api/backend/rbac/CreateRole';
import { createActionApi } from '@/server/next/createActionApi';
import { createApiErrorServerSide } from '@/server/next/createApiErrorServerSide';

export async function CreateRole(payload: Parameters<typeof endpoint.CreateRole>[1]) {
  const res = await endpoint.CreateRole(createActionApi(), payload).catch(createApiErrorServerSide);
  revalidateTag('roles');
  revalidateTag('admins');
  return res;
}
