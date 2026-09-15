import 'server-only';

import { createApiErrorServerSide } from '@/api/core/ApiError/createApiErrorServerSide';
import * as endpoint from '@/api/endpoints/reports/GetReports';
import { createRenderApi } from '@/server/next/createRenderApi';

export type { Report } from '@/api/endpoints/reports/GetReports';
export async function GetReports(payload: Parameters<typeof endpoint.GetReports>[1]) {
  const res = await endpoint
    .GetReports(
      createRenderApi().extend({
        next: {
          tags: ['reports'],
        },
      }),
      payload
    )
    .catch(createApiErrorServerSide);

  return res;
}
