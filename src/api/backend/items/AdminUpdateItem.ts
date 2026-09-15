'use server';

import { revalidateTag } from 'next/cache';
import { createApiErrorServerSide } from '@/api/core/ApiError/createApiErrorServerSide';
import * as itemApi from '@/api/endpoints/AdminUpdateItem';
import { createActionApi } from '@/server/next/createActionApi';

export async function AdminUpdateItem(id: number, payload: Parameters<typeof itemApi.AdminUpdateItem>[2]) {
  const res = await itemApi.AdminUpdateItem(createActionApi(), id, payload).catch(createApiErrorServerSide);
  revalidateTag('items');
  return res;
}
