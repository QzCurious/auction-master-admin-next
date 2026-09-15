'use server';

import * as endpoint from '@/api/backend/items/ItemAppraiserConfirmed';
import { createActionApi } from '@/server/next/createActionApi';
import { createApiErrorServerSide } from '@/server/next/createApiErrorServerSide';
import { revalidateMutation } from '@/server/next/revalidateMutation';

export async function ItemAppraiserConfirmed(id: Parameters<typeof endpoint.ItemAppraiserConfirmed>[1]) {
  const res = await endpoint.ItemAppraiserConfirmed(createActionApi(), id).catch(createApiErrorServerSide);
  if (!res.error) revalidateMutation('ItemAppraiserConfirmed');
  return res;
}
