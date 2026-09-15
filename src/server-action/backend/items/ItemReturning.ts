'use server';

import * as endpoint from '@/api/backend/items/ItemReturning';
import { createActionApi } from '@/server/next/createActionApi';
import { createApiErrorServerSide } from '@/server/next/createApiErrorServerSide';
import { revalidateMutation } from '@/server/next/revalidateMutation';

export async function ItemReturning(payload: Parameters<typeof endpoint.ItemReturning>[1]) {
  const res = await endpoint.ItemReturning(createActionApi(), payload).catch(createApiErrorServerSide);
  if (!res.error) revalidateMutation('ItemReturning');
  return res;
}
