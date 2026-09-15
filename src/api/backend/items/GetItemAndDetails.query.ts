import { type Item } from '@/api/backend/items/GetItemAndDetails';
import { GetItemAndDetails } from '@/server-action/backend/items/GetItemAndDetails';
import { type QueryOptions } from '@tanstack/react-query';

export const GetItemAndDetailQueryOptions = (id: Item['id']) =>
  ({
    queryKey: ['items', id],
    queryFn: () => GetItemAndDetails(id),
  }) satisfies QueryOptions;
