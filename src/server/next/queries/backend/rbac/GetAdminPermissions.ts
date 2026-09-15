import 'server-only';

// React's server-only cache export is provided by Next.js.
// eslint-disable-next-line import/named
import { cache } from 'react';
import * as endpoint from '@/api/backend/rbac/GetAdminPermissions';
import { createApiErrorServerSide } from '@/server/next/createApiErrorServerSide';
import { createRenderApi } from '@/server/next/createRenderApi';

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
