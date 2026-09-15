import { type AuctionItem } from '@/api/backend/auction-items/GetAuctionItem';
import { requireActionSuccess } from '@/domain/data/actionResult';
import { GetAuctionItem } from '@/server-action/backend/auction-items/GetAuctionItem';
import { type QueryOptions } from '@tanstack/react-query';

export const GetAuctionItemQueryOptions = (id: AuctionItem['auctionId']) =>
  ({
    queryKey: ['auction-items', id],
    queryFn: () => requireActionSuccess(GetAuctionItem(id)),
  }) satisfies QueryOptions;
