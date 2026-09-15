'use server';

import * as endpoint from '@/api/backend/shippings/ProcessingShipping';
import { createActionApi } from '@/server/next/createActionApi';
import { createApiErrorServerSide } from '@/server/next/createApiErrorServerSide';
import { revalidateMutation } from '@/server/next/revalidateMutation';

export async function ProcessingShipping(id: Parameters<typeof endpoint.ProcessingShipping>[1]) {
  const res = await endpoint.ProcessingShipping(createActionApi(), id).catch(createApiErrorServerSide);
  if (!res.error) revalidateMutation('ProcessingShipping');
  return res;
}
