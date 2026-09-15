'use server';

import { createApiErrorServerSide } from '@/api/core/ApiError/createApiErrorServerSide';
import * as endpoint from '@/api/endpoints/reports/GetReports';
import { createActionApi } from '@/server/next/createActionApi';

export type { Report } from '@/api/endpoints/reports/GetReports';
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
