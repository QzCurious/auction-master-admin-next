'use server';

import * as endpoint from '@/api/backend/rbac/CreateRole';
import { createActionApi } from '@/server/next/createActionApi';
import { createApiErrorServerSide } from '@/server/next/createApiErrorServerSide';
import { revalidateMutation } from '@/server/next/revalidateMutation';

export async function CreateRole(payload: Parameters<typeof endpoint.CreateRole>[1]) {
  const res = await endpoint.CreateRole(createActionApi(), payload).catch(createApiErrorServerSide);
  if (!res.error) revalidateMutation('CreateRole');
  return res;
}
