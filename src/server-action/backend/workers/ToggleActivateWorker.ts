'use server';

import * as endpoint from '@/api/backend/workers/ToggleActivateWorker';
import { createActionApi } from '@/server/next/createActionApi';
import { createApiErrorServerSide } from '@/server/next/createApiErrorServerSide';
import { revalidateMutation } from '@/server/next/revalidateMutation';

export async function ToggleActivateWorker(
  id: Parameters<typeof endpoint.ToggleActivateWorker>[1],
  payload: Parameters<typeof endpoint.ToggleActivateWorker>[2]
) {
  const res = await endpoint.ToggleActivateWorker(createActionApi(), id, payload).catch(createApiErrorServerSide);
  if (!res.error) revalidateMutation('ToggleActivateWorker');
  return res;
}
