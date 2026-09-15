'use server';

import * as endpoint from '@/api/backend/rbac/DeletePermissionForRole';
import { createActionApi } from '@/server/next/createActionApi';
import { createApiErrorServerSide } from '@/server/next/createApiErrorServerSide';
import { revalidateMutation } from '@/server/next/revalidateMutation';

export async function DeletePermissionForRole(payload: Parameters<typeof endpoint.DeletePermissionForRole>[1]) {
  const res = await endpoint.DeletePermissionForRole(createActionApi(), payload).catch(createApiErrorServerSide);
  if (!res.error) revalidateMutation('DeletePermissionForRole');
  return res;
}
