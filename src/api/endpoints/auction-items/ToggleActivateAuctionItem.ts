import { type SuccessResponseJson } from '@/api/core/static';
import { type AuctionItem } from '@/api/endpoints/auction-items/GetAuctionItems';
import { type KyInstance } from 'ky';

type Data = 'Success';

export async function ToggleActivateAuctionItem(
  api: KyInstance,
  id: AuctionItem['auctionId'],
  status: AuctionItem['status']
) {
  const res = await api.patch<SuccessResponseJson<Data>>(`backend/auction-items/${id}/${status}`).json();
  return res;
}
