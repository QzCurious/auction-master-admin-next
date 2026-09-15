'use server';

import { revalidateTag } from 'next/cache';
import { createApiErrorServerSide } from '@/api/core/ApiError/createApiErrorServerSide';
import * as endpoint from '@/api/endpoints/items/ItemWarehousePersonnelConfirmed';
import { createActionApi } from '@/server/next/createActionApi';

export async function ItemWarehousePersonnelConfirmed(
  id: Parameters<typeof endpoint.ItemWarehousePersonnelConfirmed>[1]
) {
  const res = await endpoint.ItemWarehousePersonnelConfirmed(createActionApi(), id).catch(createApiErrorServerSide);
  revalidateTag('items');
  return res;
}
