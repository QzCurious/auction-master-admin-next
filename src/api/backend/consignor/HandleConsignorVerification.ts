'use server';

import { revalidateTag } from 'next/cache';
import { createApiErrorServerSide } from '@/api/core/ApiError/createApiErrorServerSide';
import * as endpoint from '@/api/endpoints/consignor/HandleConsignorVerification';
import { createActionApi } from '@/server/next/createActionApi';

export async function HandleConsignorVerification(
  id: Parameters<typeof endpoint.HandleConsignorVerification>[1],
  action: Parameters<typeof endpoint.HandleConsignorVerification>[2]
) {
  const res = await endpoint.HandleConsignorVerification(createActionApi(), id, action).catch(createApiErrorServerSide);
  revalidateTag('consignorVerifications');
  return res;
}
