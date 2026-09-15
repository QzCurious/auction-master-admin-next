import { type AuctionItem } from '@/api/backend/auction-items/GetAuctionItems';
import { type SuccessResponseJson } from '@/api/core/static';
import { type KyInstance } from 'ky';

type Data = 'Success';

export async function DeleteAuctionItem(api: KyInstance, id: AuctionItem['auctionId']) {
  const res = await api.delete<SuccessResponseJson<Data>>(`backend/auction-items/${id}`, {}).json();
  return res;
}
