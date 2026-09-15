import { throwIfInvalid, type SuccessResponseJson } from '@/api/core/static';
import { type AuctionItem } from '@/api/endpoints/auction-items/GetAuctionItems';
import { appendEntries } from '@/domain/crud/appendEntries';
import { type KyInstance } from 'ky';
import { z } from 'zod';

const ReqSchema = z.object({
  price: z.number(),
});

type Data = 'Success';

export async function BidAuctionItem(
  api: KyInstance,
  id: AuctionItem['auctionId'],
  payload: z.input<typeof ReqSchema>
) {
  const data = throwIfInvalid(payload, ReqSchema);

  const urlencoded = new URLSearchParams();
  appendEntries(urlencoded, data);

  const res = await api
    .post<SuccessResponseJson<Data>>(`backend/auction-items/${id}/bid`, {
      body: urlencoded,
    })
    .json();
  return res;
}
