'use server';

import { revalidateTag } from 'next/cache';
import * as itemApi from '@/api/backend/items/AdminUpdateItem';
import { createActionApi } from '@/server/next/createActionApi';
import { createApiErrorServerSide } from '@/server/next/createApiErrorServerSide';

export async function AdminUpdateItem(id: number, payload: Parameters<typeof itemApi.AdminUpdateItem>[2]) {
  const res = await itemApi.AdminUpdateItem(createActionApi(), id, payload).catch(createApiErrorServerSide);
  revalidateTag('items');
  return res;
}
