'use server';

import { revalidateTag } from 'next/cache';
import { createApiErrorServerSide } from '@/api/core/ApiError/createApiErrorServerSide';
import { updateItem } from '@/api/endpoints/updateItem';
import { withApiSession } from '@/server/next/withApiSession';

export async function AdminUpdateItem(id: number, payload: Parameters<typeof updateItem>[2]) {
  const res = await withApiSession((api) => updateItem(api, id, payload)).catch(createApiErrorServerSide);
  revalidateTag('items');
  return res;
}
