'use server';

import * as endpoint from '@/api/backend/workers/SetWorkerCookie';
import { createActionApi } from '@/server/next/createActionApi';
import { createApiErrorServerSide } from '@/server/next/createApiErrorServerSide';
import { revalidateMutation } from '@/server/next/revalidateMutation';

export async function SetWorkerCookie(
  id: Parameters<typeof endpoint.SetWorkerCookie>[1],
  cookiesJsonString: Parameters<typeof endpoint.SetWorkerCookie>[2]
) {
  const res = await endpoint.SetWorkerCookie(createActionApi(), id, cookiesJsonString).catch(createApiErrorServerSide);
  if (!res.error) revalidateMutation('SetWorkerCookie');
  return res;
}
