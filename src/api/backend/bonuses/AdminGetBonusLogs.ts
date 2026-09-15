import 'server-only';

import { createApiErrorServerSide } from '@/api/core/ApiError/createApiErrorServerSide';
import * as endpoint from '@/api/endpoints/bonuses/AdminGetBonusLogs';
import { createRenderApi } from '@/server/next/createRenderApi';

export type { BonusLogs } from '@/api/endpoints/bonuses/AdminGetBonusLogs';
export async function AdminGetBonusLogs(payload: Parameters<typeof endpoint.AdminGetBonusLogs>[1]) {
  const res = await endpoint
    .AdminGetBonusLogs(createRenderApi().extend({ next: { tags: ['bonus'] } }), payload)
    .catch(createApiErrorServerSide);

  return res;
}
