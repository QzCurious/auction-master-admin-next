import 'server-only';

import * as endpoint from '@/api/backend/bonuses/AdminGetBonusLogs';
import { createApiErrorServerSide } from '@/server/next/createApiErrorServerSide';
import { createRenderApi } from '@/server/next/createRenderApi';

export async function AdminGetBonusLogs(payload: Parameters<typeof endpoint.AdminGetBonusLogs>[1]) {
  const res = await endpoint
    .AdminGetBonusLogs(createRenderApi().extend({ next: { tags: ['bonus'] } }), payload)
    .catch(createApiErrorServerSide);

  return res;
}
