import 'server-only';

import * as endpoint from '@/api/backend/reports/GetRecordsSummary';
import { createApiErrorServerSide } from '@/server/next/createApiErrorServerSide';
import { createRenderApi } from '@/server/next/createRenderApi';

export async function GetRecordsSummary(payload: Parameters<typeof endpoint.GetRecordsSummary>[1]) {
  const res = await endpoint
    .GetRecordsSummary(
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
