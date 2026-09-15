import 'server-only';

import * as endpoint from '@/api/backend/rbac/GetPermissions';
import { createApiErrorServerSide } from '@/server/next/createApiErrorServerSide';
import { createRenderApi } from '@/server/next/createRenderApi';

export async function GetPermissions() {
  const res = await endpoint.GetPermissions(createRenderApi()).catch(createApiErrorServerSide);

  return res;
}
