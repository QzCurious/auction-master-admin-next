'use server';

import * as endpoint from '@/api/backend/workers/CreateWorker';
import { createActionApi } from '@/server/next/createActionApi';
import { createApiErrorServerSide } from '@/server/next/createApiErrorServerSide';
import { revalidateMutation } from '@/server/next/revalidateMutation';

export async function CreateWorker(payload: Parameters<typeof endpoint.CreateWorker>[1]) {
  const res = await endpoint.CreateWorker(createActionApi(), payload).catch(createApiErrorServerSide);
  if (!res.error) revalidateMutation('CreateWorker');
  return res;
}
