import 'server-only';

import * as endpoint from '@/api/backend/rbac/GetRolePermissions';
import { createApiErrorServerSide } from '@/server/next/createApiErrorServerSide';
import { createRenderApi } from '@/server/next/createRenderApi';

export async function GetRolePermissions(role: Parameters<typeof endpoint.GetRolePermissions>[1]) {
  const res = await endpoint
    .GetRolePermissions(
      createRenderApi().extend({
        next: {
          tags: ['roles'],
        },
      }),
      role
    )
    .catch(createApiErrorServerSide);

  return res;
}
