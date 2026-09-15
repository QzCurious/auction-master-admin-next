import { type SuccessResponseJson } from '@/api/core/static';
import { type AuctionItem } from '@/api/endpoints/auction-items/GetAuctionItems';
import { type KyInstance } from 'ky';

type Data = 'Success';

export async function CancelAuctionItem(api: KyInstance, auctionId: AuctionItem['auctionId']) {
  const res = await api.post<SuccessResponseJson<Data>>(`backend/auction-items/${auctionId}/cancellation`, {}).json();
  return res;
}
