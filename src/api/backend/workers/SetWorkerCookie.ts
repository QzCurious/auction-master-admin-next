'use server';

import { revalidateTag } from 'next/cache';
import { createApiErrorServerSide } from '@/api/core/ApiError/createApiErrorServerSide';
import * as endpoint from '@/api/endpoints/workers/SetWorkerCookie';
import { createActionApi } from '@/server/next/createActionApi';

export async function SetWorkerCookie(
  id: Parameters<typeof endpoint.SetWorkerCookie>[1],
  cookiesJsonString: Parameters<typeof endpoint.SetWorkerCookie>[2]
) {
  const res = await endpoint.SetWorkerCookie(createActionApi(), id, cookiesJsonString).catch(createApiErrorServerSide);
  revalidateTag('workers');
  return res;
}
