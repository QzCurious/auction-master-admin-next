import { type Item } from '@/api/backend/items/GetItemAndDetails';
import { requireActionSuccess } from '@/domain/data/actionResult';
import { GetItemAndDetails } from '@/server-action/backend/items/GetItemAndDetails';
import { type QueryOptions } from '@tanstack/react-query';

export const GetItemAndDetailQueryOptions = (id: Item['id']) =>
  ({
    queryKey: ['items', id],
    queryFn: () => requireActionSuccess(GetItemAndDetails(id)),
  }) satisfies QueryOptions;
