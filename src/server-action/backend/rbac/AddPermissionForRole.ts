'use server';

import * as endpoint from '@/api/backend/rbac/AddPermissionForRole';
import { createActionApi } from '@/server/next/createActionApi';
import { createApiErrorServerSide } from '@/server/next/createApiErrorServerSide';
import { revalidateMutation } from '@/server/next/revalidateMutation';

export async function AddPermissionForRole(payload: Parameters<typeof endpoint.AddPermissionForRole>[1]) {
  const res = await endpoint.AddPermissionForRole(createActionApi(), payload).catch(createApiErrorServerSide);
  if (!res.error) revalidateMutation('AddPermissionForRole');
  return res;
}
