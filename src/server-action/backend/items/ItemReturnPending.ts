'use server';

import { revalidateTag } from 'next/cache';
import * as endpoint from '@/api/backend/items/ItemReturnPending';
import { createActionApi } from '@/server/next/createActionApi';
import { createApiErrorServerSide } from '@/server/next/createApiErrorServerSide';

export async function ItemReturnPending(id: Parameters<typeof endpoint.ItemReturnPending>[1]) {
  const res = await endpoint.ItemReturnPending(createActionApi(), id).catch(createApiErrorServerSide);
  revalidateTag('items');
  revalidateTag('auction-items');
  return res;
}
