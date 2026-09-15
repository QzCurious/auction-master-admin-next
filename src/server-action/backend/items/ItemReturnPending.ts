'use server';

import * as endpoint from '@/api/backend/items/ItemReturnPending';
import { createActionApi } from '@/server/next/createActionApi';
import { createApiErrorServerSide } from '@/server/next/createApiErrorServerSide';
import { revalidateMutation } from '@/server/next/revalidateMutation';

export async function ItemReturnPending(id: Parameters<typeof endpoint.ItemReturnPending>[1]) {
  const res = await endpoint.ItemReturnPending(createActionApi(), id).catch(createApiErrorServerSide);
  if (!res.error) revalidateMutation('ItemReturnPending');
  return res;
}
