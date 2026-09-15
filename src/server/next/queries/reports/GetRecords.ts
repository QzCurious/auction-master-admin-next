import 'server-only';

import { createApiErrorServerSide } from '@/api/core/ApiError/createApiErrorServerSide';
import * as endpoint from '@/api/endpoints/reports/GetRecords';
import { createRenderApi } from '@/server/next/createRenderApi';

export type { Record } from '@/api/endpoints/reports/GetRecords';
export async function GetRecords(payload: Parameters<typeof endpoint.GetRecords>[1]) {
  const res = await endpoint
    .GetRecords(
      createRenderApi().extend({
        next: {
          tags: ['records'],
        },
      }),
      payload
    )
    .catch(createApiErrorServerSide);

  return res;
}
