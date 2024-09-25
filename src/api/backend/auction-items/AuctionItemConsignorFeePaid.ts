'use server';

import { revalidateTag } from 'next/cache';
import { apiClient } from '@/api/apiClient';
import { throwIfInvalid } from '@/api/helpers/throwIfInvalid';
import { withAuth } from '@/api/withAuth';
import { appendEntries } from '@/domain/crud/appendEntries';
import { z } from 'zod';

const ReqSchema = z.object({
  id: z.number().array(),
});

type Data = 'Success';

type ErrorCode = 'never';

export async function AuctionItemConsignorFeePaid(payload: z.input<typeof ReqSchema>) {
  const parsed = throwIfInvalid(payload, ReqSchema);

  const urlencoded = new URLSearchParams();
  appendEntries(urlencoded, parsed);

  const res = await withAuth(apiClient)<Data, ErrorCode>(`/backend/auction-items/consignor-fee-paid`, {
    method: 'POST',
    body: urlencoded,
  });

  revalidateTag('auction-items');

  return res;
}
