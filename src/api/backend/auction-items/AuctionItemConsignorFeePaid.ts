import { throwIfInvalid, type SuccessResponseJson } from '@/api/core/static';
import { appendEntries } from '@/domain/crud/appendEntries';
import { type KyInstance } from 'ky';
import { z } from 'zod';

const ReqSchema = z.object({
  auctionId: z.string().array(),
});

type Data = 'Success';

export async function AuctionItemConsignorFeePaid(api: KyInstance, payload: z.input<typeof ReqSchema>) {
  const parsed = throwIfInvalid(payload, ReqSchema);

  const urlencoded = new URLSearchParams();
  appendEntries(urlencoded, parsed);

  const res = await api
    .post<SuccessResponseJson<Data>>(`backend/auction-items/consignor-fee-paid`, {
      body: urlencoded,
    })
    .json();
  return res;
}
