import 'server-only';

import * as endpoint from '@/api/backend/rbac/GetRoles';
import { createApiErrorServerSide } from '@/server/next/createApiErrorServerSide';
import { createRenderApi } from '@/server/next/createRenderApi';

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
