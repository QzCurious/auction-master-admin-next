'use server';

import { revalidateTag } from 'next/cache';
import * as endpoint from '@/api/backend/auction-items/CompanyPurchased';
import { createActionApi } from '@/server/next/createActionApi';
import { createApiErrorServerSide } from '@/server/next/createApiErrorServerSide';

export async function CompanyPurchased(id: Parameters<typeof endpoint.CompanyPurchased>[1]) {
  const res = await endpoint.CompanyPurchased(createActionApi(), id).catch(createApiErrorServerSide);
  revalidateTag('auction-items');
  revalidateTag('items');
  revalidateTag('shippings');
  revalidateTag('records');
  revalidateTag('reports');
  revalidateTag('wallets');
  revalidateTag('bonus');
  return res;
}
