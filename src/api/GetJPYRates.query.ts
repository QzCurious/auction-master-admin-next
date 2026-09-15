import { requireActionSuccess } from '@/domain/data/actionResult';
import { GetJPYRates } from '@/server-action/GetJPYRates';
import { type QueryOptions } from '@tanstack/react-query';

export const GetJPYRatesQueryOptions = {
  queryKey: ['jpy-rates'],
  queryFn: () => requireActionSuccess(GetJPYRates()),
} satisfies QueryOptions;
