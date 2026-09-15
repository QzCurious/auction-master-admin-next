'use server';

import * as endpoint from '@/api/backend/items/ItemReturned';
import { createActionApi } from '@/server/next/createActionApi';
import { createApiErrorServerSide } from '@/server/next/createApiErrorServerSide';
import { revalidateMutation } from '@/server/next/revalidateMutation';

export async function ItemReturned(id: Parameters<typeof endpoint.ItemReturned>[1]) {
  const res = await endpoint.ItemReturned(createActionApi(), id).catch(createApiErrorServerSide);
  if (!res.error) revalidateMutation('ItemReturned');
  return res;
}
