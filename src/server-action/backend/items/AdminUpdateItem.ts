'use server';

import * as itemApi from '@/api/backend/items/AdminUpdateItem';
import { createActionApi } from '@/server/next/createActionApi';
import { createApiErrorServerSide } from '@/server/next/createApiErrorServerSide';
import { revalidateMutation } from '@/server/next/revalidateMutation';

export async function AdminUpdateItem(id: number, payload: Parameters<typeof itemApi.AdminUpdateItem>[2]) {
  const res = await itemApi.AdminUpdateItem(createActionApi(), id, payload).catch(createApiErrorServerSide);
  if (!res.error) revalidateMutation('AdminUpdateItem');
  return res;
}
