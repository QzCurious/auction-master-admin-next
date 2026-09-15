'use server';

import * as endpoint from '@/api/backend/items/ItemWarehousePersonnelConfirmed';
import { createActionApi } from '@/server/next/createActionApi';
import { createApiErrorServerSide } from '@/server/next/createApiErrorServerSide';
import { revalidateMutation } from '@/server/next/revalidateMutation';

export async function ItemWarehousePersonnelConfirmed(
  id: Parameters<typeof endpoint.ItemWarehousePersonnelConfirmed>[1]
) {
  const res = await endpoint.ItemWarehousePersonnelConfirmed(createActionApi(), id).catch(createApiErrorServerSide);
  if (!res.error) revalidateMutation('ItemWarehousePersonnelConfirmed');
  return res;
}
