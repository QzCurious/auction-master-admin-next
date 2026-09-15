import 'server-only';

import { createApiErrorServerSide } from '@/api/core/ApiError/createApiErrorServerSide';
import * as endpoint from '@/api/endpoints/rbac/GetRoles';
import { createRenderApi } from '@/server/next/createRenderApi';

export type { Role } from '@/api/endpoints/rbac/GetRoles';
export async function GetRoles() {
  const res = await endpoint
    .GetRoles(
      createRenderApi().extend({
        next: {
          tags: ['roles'],
        },
      })
    )
    .catch(createApiErrorServerSide);

  return res;
}
