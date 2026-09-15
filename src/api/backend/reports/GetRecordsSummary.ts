'use server';

import { createApiErrorServerSide } from '@/api/core/ApiError/createApiErrorServerSide';
import * as endpoint from '@/api/endpoints/reports/GetRecordsSummary';
import { createActionApi } from '@/server/next/createActionApi';

export type { RecordSummary } from '@/api/endpoints/reports/GetRecordsSummary';
export async function GetRecordsSummary(payload: Parameters<typeof endpoint.GetRecordsSummary>[1]) {
  const res = await endpoint
    .GetRecordsSummary(
      createActionApi().extend({
        next: {
          tags: ['records'],
        },
      }),
      payload
    )
    .catch(createApiErrorServerSide);

  return res;
}
