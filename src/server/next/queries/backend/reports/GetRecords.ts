import 'server-only';

import * as endpoint from '@/api/backend/reports/GetRecords';
import { createApiErrorServerSide } from '@/server/next/createApiErrorServerSide';
import { createRenderApi } from '@/server/next/createRenderApi';

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
