'use server';

import { revalidateTag } from 'next/cache';
import * as endpoint from '@/api/backend/items/ItemWarehousePersonnelConfirmed';
import { createActionApi } from '@/server/next/createActionApi';
import { createApiErrorServerSide } from '@/server/next/createApiErrorServerSide';

export async function ItemWarehousePersonnelConfirmed(
  id: Parameters<typeof endpoint.ItemWarehousePersonnelConfirmed>[1]
) {
  const res = await endpoint.ItemWarehousePersonnelConfirmed(createActionApi(), id).catch(createApiErrorServerSide);
  revalidateTag('items');
  revalidateTag('auction-items');
  return res;
}
