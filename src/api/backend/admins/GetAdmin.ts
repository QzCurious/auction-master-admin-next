import 'server-only';

import { createApiErrorServerSide } from '@/api/core/ApiError/createApiErrorServerSide';
import * as endpoint from '@/api/endpoints/admins/GetAdmin';
import { createRenderApi } from '@/server/next/createRenderApi';

export type { Admin } from '@/api/endpoints/admins/GetAdmin';
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
