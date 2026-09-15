import { throwIfInvalid, type SuccessResponseJson } from '@/api/core/static';
import { appendEntries } from '@/domain/crud/appendEntries';
import { type KyInstance } from 'ky';
import { z } from 'zod';

const ReqSchema = z.object({
  auctionId: z.string(),
});

type Data = 'Success';

export async function ItemBidding(api: KyInstance, id: number, payload: z.input<typeof ReqSchema>) {
  const data = throwIfInvalid(payload, ReqSchema);

  const urlencoded = new URLSearchParams();
  appendEntries(urlencoded, data);

  const res = await api
    .post<SuccessResponseJson<Data>>(`backend/items/${id}/bidding`, {
      body: urlencoded,
    })
    .json();
  return res;
}
