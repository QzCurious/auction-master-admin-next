'use server';

import { createApiErrorServerSide } from '@/api/core/ApiError/createApiErrorServerSide';
import * as endpoint from '@/api/endpoints/reports/GetRecords';
import { createActionApi } from '@/server/next/createActionApi';

export type { Record } from '@/api/endpoints/reports/GetRecords';
export async function GetRecords(payload: Parameters<typeof endpoint.GetRecords>[1]) {
  const res = await endpoint
    .GetRecords(
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
