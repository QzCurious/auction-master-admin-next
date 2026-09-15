import 'server-only';

import * as endpoint from '@/api/GetConfigs';
import { api } from '@/server/api';
import { createApiErrorServerSide } from '@/server/next/createApiErrorServerSide';

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
