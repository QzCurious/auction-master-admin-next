'use server';

import * as endpoint from '@/api/backend/admins/UpdateAdminPassword';
import { createActionApi } from '@/server/next/createActionApi';
import { createApiErrorServerSide } from '@/server/next/createApiErrorServerSide';

export async function UpdateAdminPassword(
  id: Parameters<typeof endpoint.UpdateAdminPassword>[1],
  payload: Parameters<typeof endpoint.UpdateAdminPassword>[2]
) {
  const res = await endpoint.UpdateAdminPassword(createActionApi(), id, payload).catch(createApiErrorServerSide);

  return res;
}
