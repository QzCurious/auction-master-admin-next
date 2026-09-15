import 'server-only';

import { createApiErrorServerSide } from '@/api/core/ApiError/createApiErrorServerSide';
import * as endpoint from '@/api/endpoints/reports/GetRecordsSummary';
import { createRenderApi } from '@/server/next/createRenderApi';

export type { RecordSummary } from '@/api/endpoints/reports/GetRecordsSummary';
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
