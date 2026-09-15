'use server';

import * as endpoint from '@/api/backend/workers/DeleteWorker';
import { createActionApi } from '@/server/next/createActionApi';
import { createApiErrorServerSide } from '@/server/next/createApiErrorServerSide';
import { revalidateMutation } from '@/server/next/revalidateMutation';

export async function DeleteWorker(id: Parameters<typeof endpoint.DeleteWorker>[1]) {
  const res = await endpoint.DeleteWorker(createActionApi(), id).catch(createApiErrorServerSide);
  if (!res.error) revalidateMutation('DeleteWorker');
  return res;
}
