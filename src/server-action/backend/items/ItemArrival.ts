'use server';

import * as endpoint from '@/api/backend/items/ItemArrival';
import { createActionApi } from '@/server/next/createActionApi';
import { createApiErrorServerSide } from '@/server/next/createApiErrorServerSide';
import { revalidateMutation } from '@/server/next/revalidateMutation';

export async function ItemArrival(id: Parameters<typeof endpoint.ItemArrival>[1]) {
  const res = await endpoint.ItemArrival(createActionApi(), id).catch(createApiErrorServerSide);
  if (!res.error) revalidateMutation('ItemArrival');
  return res;
}
