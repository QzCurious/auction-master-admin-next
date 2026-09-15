'use server';

import { revalidateTag } from 'next/cache';
import * as endpoint from '@/api/backend/workers/DeleteWorker';
import { createActionApi } from '@/server/next/createActionApi';
import { createApiErrorServerSide } from '@/server/next/createApiErrorServerSide';

export async function DeleteWorker(id: Parameters<typeof endpoint.DeleteWorker>[1]) {
  const res = await endpoint.DeleteWorker(createActionApi(), id).catch(createApiErrorServerSide);
  revalidateTag('workers');
  return res;
}
