import 'server-only';

// React's server-only cache export is provided by Next.js.
// eslint-disable-next-line import/named
import { cache } from 'react';
import { createApiErrorServerSide } from '@/api/core/ApiError/createApiErrorServerSide';
import * as endpoint from '@/api/endpoints/rbac/GetAdminPermissions';
import { createRenderApi } from '@/server/next/createRenderApi';

export type { Permissions } from '@/api/endpoints/rbac/GetAdminPermissions';
async function GetAdminPermissions(account: Parameters<typeof endpoint.GetAdminPermissions>[1]) {
  const res = await endpoint
    .GetAdminPermissions(
      createRenderApi().extend({
        next: {
          tags: ['roles', 'admins'],
        },
      }),
      account
    )
    .catch(createApiErrorServerSide);

  return res;
}
const CachedGetAdminPermissions = cache(GetAdminPermissions);
export { CachedGetAdminPermissions as GetAdminPermissions };
