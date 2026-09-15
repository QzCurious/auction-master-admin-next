import 'server-only';

import { createApiErrorServerSide } from '@/api/core/ApiError/createApiErrorServerSide';
import * as endpoint from '@/api/endpoints/rbac/GetPermissions';
import { createRenderApi } from '@/server/next/createRenderApi';

export type { Permission, PermissionGroup } from '@/api/endpoints/rbac/GetPermissions';
export async function GetPermissions() {
  const res = await endpoint.GetPermissions(createRenderApi()).catch(createApiErrorServerSide);

  return res;
}
