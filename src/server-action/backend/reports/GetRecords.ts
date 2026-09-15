'use server';

import * as endpoint from '@/api/backend/reports/GetRecords';
import { createActionApi } from '@/server/next/createActionApi';
import { createApiErrorServerSide } from '@/server/next/createApiErrorServerSide';

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
