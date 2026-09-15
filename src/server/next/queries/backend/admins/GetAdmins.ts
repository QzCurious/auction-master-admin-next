import 'server-only';

import * as endpoint from '@/api/backend/admins/GetAdmins';
import { createApiErrorServerSide } from '@/server/next/createApiErrorServerSide';
import { createRenderApi } from '@/server/next/createRenderApi';

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
