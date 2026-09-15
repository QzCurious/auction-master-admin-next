'use server';

import * as endpoint from '@/api/backend/items/AdminDeleteItemPhoto';
import { createActionApi } from '@/server/next/createActionApi';
import { createApiErrorServerSide } from '@/server/next/createApiErrorServerSide';
import { revalidateMutation } from '@/server/next/revalidateMutation';

export async function AdminDeleteItemPhoto(
  id: Parameters<typeof endpoint.AdminDeleteItemPhoto>[1],
  sorted: Parameters<typeof endpoint.AdminDeleteItemPhoto>[2]
) {
  const res = await endpoint.AdminDeleteItemPhoto(createActionApi(), id, sorted).catch(createApiErrorServerSide);
  if (!res.error) revalidateMutation('AdminDeleteItemPhoto');
  return res;
}
