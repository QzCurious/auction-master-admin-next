'use server';

import { createApiErrorServerSide } from '@/api/core/ApiError/createApiErrorServerSide';
import { getItemsAndDetails } from '@/api/endpoints/getItemsAndDetails';
import { withApiSession } from '@/server/next/withApiSession';
import { withCacheTags } from '@/server/next/withCacheTags';

export type { Item, StatusCount } from '@/api/endpoints/getItemsAndDetails';

/** Browser-callable compatibility action; rendering uses the explicit read adapter. */
export async function GetItemsAndDetails(payload: Parameters<typeof getItemsAndDetails>[1]) {
  return withApiSession((api) => getItemsAndDetails(withCacheTags(api, ['items']), payload)).catch(
    createApiErrorServerSide
  );
}
