'use server';

import * as endpoint from '@/api/backend/reports/GetRecordsSummary';
import { createActionApi } from '@/server/next/createActionApi';
import { createApiErrorServerSide } from '@/server/next/createApiErrorServerSide';

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
