'use server';

import { revalidateTag } from 'next/cache';
import { createApiErrorServerSide } from '@/api/core/ApiError/createApiErrorServerSide';
import * as endpoint from '@/api/endpoints/items/ItemReturnPending';
import { createActionApi } from '@/server/next/createActionApi';

export async function ItemReturnPending(id: Parameters<typeof endpoint.ItemReturnPending>[1]) {
  const res = await endpoint.ItemReturnPending(createActionApi(), id).catch(createApiErrorServerSide);
  revalidateTag('items');
  return res;
}
