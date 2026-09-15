import 'server-only';

import * as endpoint from '@/api/backend/admins/GetAdmin';
import { createApiErrorServerSide } from '@/server/next/createApiErrorServerSide';
import { createRenderApi } from '@/server/next/createRenderApi';

export async function GetAdmin(id: Parameters<typeof endpoint.GetAdmin>[1]) {
  const res = await endpoint
    .GetAdmin(
      createRenderApi().extend({
        next: {
          tags: ['admins'],
        },
      }),
      id
    )
    .catch(createApiErrorServerSide);

  return res;
}
