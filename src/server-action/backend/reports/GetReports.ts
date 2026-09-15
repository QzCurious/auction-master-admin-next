'use server';

import * as endpoint from '@/api/backend/reports/GetReports';
import { createActionApi } from '@/server/next/createActionApi';
import { createApiErrorServerSide } from '@/server/next/createApiErrorServerSide';

export async function GetReports(payload: Parameters<typeof endpoint.GetReports>[1]) {
  const res = await endpoint
    .GetReports(
      createActionApi().extend({
        next: {
          tags: ['reports'],
        },
      }),
      payload
    )
    .catch(createApiErrorServerSide);

  return res;
}
