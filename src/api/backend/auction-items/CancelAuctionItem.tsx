'use server';

import { revalidateTag } from 'next/cache';
import { apiClient } from '@/api/apiClient';
import { throwIfInvalid } from '@/api/helpers/throwIfInvalid';
import { withAuth } from '@/api/withAuth';
import { appendEntries } from '@/static';
import { z } from 'zod';

const ReqSchema = z.object({
  id: z.number(),
});

type Data = 'Success';

type ErrorCode = never;

export async function CancelAuctionItem(payload: z.input<typeof ReqSchema>) {
  const data = throwIfInvalid(payload, ReqSchema);

  const urlencoded = new URLSearchParams();
  appendEntries(urlencoded, data);

  const res = await withAuth(apiClient)<Data, ErrorCode>(`/auction-items/cancellation`, {
    method: 'POST',
    body: urlencoded,
  });

  revalidateTag('auction-items');

  return res;
}
