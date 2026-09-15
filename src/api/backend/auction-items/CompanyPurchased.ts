'use server';

import { revalidateTag } from 'next/cache';
import { createApiErrorServerSide } from '@/api/core/ApiError/createApiErrorServerSide';
import * as endpoint from '@/api/endpoints/auction-items/CompanyPurchased';
import { createActionApi } from '@/server/next/createActionApi';

export async function CompanyPurchased(id: Parameters<typeof endpoint.CompanyPurchased>[1]) {
  const res = await endpoint.CompanyPurchased(createActionApi(), id).catch(createApiErrorServerSide);
  revalidateTag('auction-items');
  return res;
}
