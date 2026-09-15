'use server';

import { createApiErrorServerSide } from '@/api/core/ApiError/createApiErrorServerSide';
import * as endpoint from '@/api/endpoints/admins/UpdateAdminPassword';
import { createActionApi } from '@/server/next/createActionApi';

export async function UpdateAdminPassword(
  id: Parameters<typeof endpoint.UpdateAdminPassword>[1],
  payload: Parameters<typeof endpoint.UpdateAdminPassword>[2]
) {
  const res = await endpoint.UpdateAdminPassword(createActionApi(), id, payload).catch(createApiErrorServerSide);

  return res;
}
