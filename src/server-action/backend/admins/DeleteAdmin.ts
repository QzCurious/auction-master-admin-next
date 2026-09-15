'use server';

import * as endpoint from '@/api/backend/admins/DeleteAdmin';
import { createActionApi } from '@/server/next/createActionApi';
import { createApiErrorServerSide } from '@/server/next/createApiErrorServerSide';
import { revalidateMutation } from '@/server/next/revalidateMutation';

export async function DeleteAdmin(id: Parameters<typeof endpoint.DeleteAdmin>[1]) {
  const res = await endpoint.DeleteAdmin(createActionApi(), id).catch(createApiErrorServerSide);
  if (!res.error) revalidateMutation('DeleteAdmin');
  return res;
}
