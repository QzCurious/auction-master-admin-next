import { type QueryOptions } from '@tanstack/react-query';

import { GetItemAndDetails, type Item } from './GetItemAndDetails';

export const GetItemAndDetailQueryOptions = (id: Item['id']) =>
  ({
    queryKey: ['items', id],
    queryFn: () => GetItemAndDetails(id),
  }) satisfies QueryOptions;
