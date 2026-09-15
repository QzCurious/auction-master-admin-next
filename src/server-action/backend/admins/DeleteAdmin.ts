'use server';

import { revalidateTag } from 'next/cache';
import * as endpoint from '@/api/backend/admins/DeleteAdmin';
import { createActionApi } from '@/server/next/createActionApi';
import { createApiErrorServerSide } from '@/server/next/createApiErrorServerSide';

export async function DeleteAdmin(id: Parameters<typeof endpoint.DeleteAdmin>[1]) {
  const res = await endpoint.DeleteAdmin(createActionApi(), id).catch(createApiErrorServerSide);
  revalidateTag('admins');
  return res;
}
