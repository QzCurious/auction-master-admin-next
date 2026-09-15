'use server';

import * as endpoint from '@/api/backend/auction-items/CompanyPurchased';
import { createActionApi } from '@/server/next/createActionApi';
import { createApiErrorServerSide } from '@/server/next/createApiErrorServerSide';
import { revalidateMutation } from '@/server/next/revalidateMutation';

export async function CompanyPurchased(id: Parameters<typeof endpoint.CompanyPurchased>[1]) {
  const res = await endpoint.CompanyPurchased(createActionApi(), id).catch(createApiErrorServerSide);
  if (!res.error) revalidateMutation('CompanyPurchased');
  return res;
}
