import 'server-only';

import * as endpoint from '@/api/GetJPYRates';
import { createApiErrorServerSide } from '@/server/next/createApiErrorServerSide';
import { createRenderApi } from '@/server/next/createRenderApi';

export async function GetJPYRates() {
  const res = await endpoint
    .GetJPYRates(createRenderApi().extend({ next: { tags: ['jpy-rates'] } }))
    .catch(createApiErrorServerSide);

  return res;
}
