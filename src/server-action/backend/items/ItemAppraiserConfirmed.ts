'use server';

import { revalidateTag } from 'next/cache';
import * as endpoint from '@/api/backend/items/ItemAppraiserConfirmed';
import { createActionApi } from '@/server/next/createActionApi';
import { createApiErrorServerSide } from '@/server/next/createApiErrorServerSide';

export async function ItemAppraiserConfirmed(id: Parameters<typeof endpoint.ItemAppraiserConfirmed>[1]) {
  const res = await endpoint.ItemAppraiserConfirmed(createActionApi(), id).catch(createApiErrorServerSide);
  revalidateTag('items');
  revalidateTag('auction-items');
  return res;
}
