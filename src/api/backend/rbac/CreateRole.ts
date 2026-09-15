'use server';

import { revalidateTag } from 'next/cache';
import { createApiErrorServerSide } from '@/api/core/ApiError/createApiErrorServerSide';
import * as endpoint from '@/api/endpoints/rbac/CreateRole';
import { createActionApi } from '@/server/next/createActionApi';

export async function CreateRole(payload: Parameters<typeof endpoint.CreateRole>[1]) {
  const res = await endpoint.CreateRole(createActionApi(), payload).catch(createApiErrorServerSide);
  revalidateTag('roles');
  return res;
}
