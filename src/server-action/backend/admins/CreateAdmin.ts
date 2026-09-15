'use server';

import * as endpoint from '@/api/backend/admins/CreateAdmin';
import { createActionApi } from '@/server/next/createActionApi';
import { createApiErrorServerSide } from '@/server/next/createApiErrorServerSide';
import { revalidateMutation } from '@/server/next/revalidateMutation';

export async function CreateAdmin(payload: Parameters<typeof endpoint.CreateAdmin>[1]) {
  const res = await endpoint.CreateAdmin(createActionApi(), payload).catch(createApiErrorServerSide);
  if (!res.error) revalidateMutation('CreateAdmin');
  return res;
}
