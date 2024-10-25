'use server';

import { revalidateTag } from 'next/cache';
import { apiClientWithToken } from '@/api/core/apiClientWithToken';
import { createApiErrorServerSide } from '@/api/core/ApiError/createApiErrorServerSide';
import { throwIfInvalid, type SuccessResponseJson } from '@/api/core/static';
import { appendEntries } from '@/domain/crud/appendEntries';
import { z } from 'zod';

const ReqSchema = z.object({
  auctionId: z.string().array(),
});

type Data = 'Success';

export async function AuctionItemConsignorFeePaid(payload: z.input<typeof ReqSchema>) {
  const parsed = throwIfInvalid(payload, ReqSchema);

  const urlencoded = new URLSearchParams();
  appendEntries(urlencoded, parsed);

  const res = await apiClientWithToken
    .post<SuccessResponseJson<Data>>(`backend/auction-items/consignor-fee-paid`, {
      body: urlencoded,
    })
    .json()
    .catch(createApiErrorServerSide);

  revalidateTag('auction-items');

  return res;
}
