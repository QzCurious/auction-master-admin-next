import 'server-only';

import { createApiErrorServerSide } from '@/api/core/ApiError/createApiErrorServerSide';
import * as endpoint from '@/api/endpoints/GetJPYRates';
import { createRenderApi } from '@/server/next/createRenderApi';

export async function GetJPYRates() {
  const res = await endpoint
    .GetJPYRates(createRenderApi().extend({ next: { tags: ['jpy-rates'] } }))
    .catch(createApiErrorServerSide);

  return res;
}
