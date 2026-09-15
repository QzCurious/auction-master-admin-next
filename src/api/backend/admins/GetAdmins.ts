import 'server-only';

import { createApiErrorServerSide } from '@/api/core/ApiError/createApiErrorServerSide';
import * as endpoint from '@/api/endpoints/admins/GetAdmins';
import { createRenderApi } from '@/server/next/createRenderApi';

export type { Admin } from '@/api/endpoints/admins/GetAdmins';
export async function GetAdmins(payload: Parameters<typeof endpoint.GetAdmins>[1]) {
  const res = await endpoint
    .GetAdmins(
      createRenderApi().extend({
        next: {
          tags: ['admins'],
        },
      }),
      payload
    )
    .catch(createApiErrorServerSide);

  return res;
}
