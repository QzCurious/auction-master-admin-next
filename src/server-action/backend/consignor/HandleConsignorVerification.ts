'use server';

import { revalidateTag } from 'next/cache';
import * as endpoint from '@/api/backend/consignor/HandleConsignorVerification';
import { createActionApi } from '@/server/next/createActionApi';
import { createApiErrorServerSide } from '@/server/next/createApiErrorServerSide';

export async function HandleConsignorVerification(
  id: Parameters<typeof endpoint.HandleConsignorVerification>[1],
  action: Parameters<typeof endpoint.HandleConsignorVerification>[2]
) {
  const res = await endpoint.HandleConsignorVerification(createActionApi(), id, action).catch(createApiErrorServerSide);
  revalidateTag('consignorVerifications');
  return res;
}
