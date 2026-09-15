import { type AuctionItem } from '@/api/backend/auction-items/GetAuctionItem';
import { GetAuctionItem } from '@/server-action/backend/auction-items/GetAuctionItem';
import { type QueryOptions } from '@tanstack/react-query';

export const GetAuctionItemQueryOptions = (id: AuctionItem['auctionId']) =>
  ({
    queryKey: ['auction-items', id],
    queryFn: () => GetAuctionItem(id),
  }) satisfies QueryOptions;
