'use server';

import { revalidateTag } from 'next/cache';
import { createApiErrorServerSide } from '@/api/core/ApiError/createApiErrorServerSide';
import * as endpoint from '@/api/endpoints/items/ItemAppraiserConfirmed';
import { createActionApi } from '@/server/next/createActionApi';

export async function ItemAppraiserConfirmed(id: Parameters<typeof endpoint.ItemAppraiserConfirmed>[1]) {
  const res = await endpoint.ItemAppraiserConfirmed(createActionApi(), id).catch(createApiErrorServerSide);
  revalidateTag('items');
  return res;
}
