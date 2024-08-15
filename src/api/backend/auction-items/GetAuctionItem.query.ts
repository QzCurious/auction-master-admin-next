import { type QueryOptions } from '@tanstack/react-query';

import { GetAuctionItem, type AuctionItem } from './GetAuctionItem';

export const GetAuctionItemQueryOptions = (id: AuctionItem['id']) =>
  ({
    queryKey: ['auction-items', id],
    queryFn: () => GetAuctionItem(id),
  }) satisfies QueryOptions;
