import 'server-only';

import * as endpoint from '@/api/backend/reports/GetReports';
import { createApiErrorServerSide } from '@/server/next/createApiErrorServerSide';
import { createRenderApi } from '@/server/next/createRenderApi';

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
