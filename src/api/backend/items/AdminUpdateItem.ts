'use server';

import { revalidateTag } from 'next/cache';
import { createApiErrorServerSide } from '@/api/core/ApiError/createApiErrorServerSide';
import * as itemApi from '@/api/endpoints/AdminUpdateItem';
import { withApiSession } from '@/server/next/withApiSession';

export async function AdminUpdateItem(id: number, payload: Parameters<typeof itemApi.AdminUpdateItem>[2]) {
  const res = await withApiSession((api) => itemApi.AdminUpdateItem(api, id, payload)).catch(createApiErrorServerSide);
  revalidateTag('items');
  return res;
}
