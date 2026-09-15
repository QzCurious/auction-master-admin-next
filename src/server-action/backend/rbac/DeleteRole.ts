'use server';

import * as endpoint from '@/api/backend/rbac/DeleteRole';
import { createActionApi } from '@/server/next/createActionApi';
import { createApiErrorServerSide } from '@/server/next/createApiErrorServerSide';
import { revalidateMutation } from '@/server/next/revalidateMutation';

export async function DeleteRole(role: Parameters<typeof endpoint.DeleteRole>[1]) {
  const res = await endpoint.DeleteRole(createActionApi(), role).catch(createApiErrorServerSide);
  if (!res.error) revalidateMutation('DeleteRole');
  return res;
}
