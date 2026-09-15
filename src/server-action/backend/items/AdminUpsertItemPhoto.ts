'use server';

import * as endpoint from '@/api/backend/items/AdminUpsertItemPhoto';
import { createActionApi } from '@/server/next/createActionApi';
import { createApiErrorServerSide } from '@/server/next/createApiErrorServerSide';
import { revalidateMutation } from '@/server/next/revalidateMutation';

export async function AdminUpsertItemPhoto(
  id: Parameters<typeof endpoint.AdminUpsertItemPhoto>[1],
  formData: Parameters<typeof endpoint.AdminUpsertItemPhoto>[2]
) {
  const res = await endpoint.AdminUpsertItemPhoto(createActionApi(), id, formData).catch(createApiErrorServerSide);
  if (!res.error) revalidateMutation('AdminUpsertItemPhoto');
  return res;
}
