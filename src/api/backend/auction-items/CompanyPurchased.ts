import { type AuctionItem } from '@/api/backend/auction-items/GetAuctionItems';
import { type SuccessResponseJson } from '@/api/core/static';
import { type KyInstance } from 'ky';

type Data = 'Success';

export async function CompanyPurchased(api: KyInstance, id: AuctionItem['auctionId']) {
  const res = await api.post<SuccessResponseJson<Data>>(`backend/auction-items/${id}/company-purchased`, {}).json();
  return res;
}
