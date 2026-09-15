import 'server-only';

import { createApiErrorServerSide } from '@/api/core/ApiError/createApiErrorServerSide';
import * as endpoint from '@/api/endpoints/GetConfigs';
import { api } from '@/server/api';

export type { Configs } from '@/api/endpoints/GetConfigs';
export async function GetConfigs() {
  const res = await endpoint
    .GetConfigs(
      api.extend({
        next: {
          tags: ['config'],
        },
      })
    )
    .catch(createApiErrorServerSide);

  return res;
}
