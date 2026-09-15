import 'server-only';

import { createApiErrorServerSide } from '@/api/core/ApiError/createApiErrorServerSide';
import * as endpoint from '@/api/endpoints/rbac/GetRolePermissions';
import { createRenderApi } from '@/server/next/createRenderApi';

export type { RolePermissions } from '@/api/endpoints/rbac/GetRolePermissions';
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
