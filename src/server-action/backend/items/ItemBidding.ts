'use server';

import * as endpoint from '@/api/backend/items/ItemBidding';
import { createActionApi } from '@/server/next/createActionApi';
import { createApiErrorServerSide } from '@/server/next/createApiErrorServerSide';
import { revalidateMutation } from '@/server/next/revalidateMutation';

export async function ItemBidding(
  id: Parameters<typeof endpoint.ItemBidding>[1],
  payload: Parameters<typeof endpoint.ItemBidding>[2]
) {
  const res = await endpoint.ItemBidding(createActionApi(), id, payload).catch(createApiErrorServerSide);
  if (!res.error) revalidateMutation('ItemBidding');
  return res;
}
