import { GetJPYRates } from '@/server-action/GetJPYRates';
import { type QueryOptions } from '@tanstack/react-query';

export const GetJPYRatesQueryOptions = {
  queryKey: ['jpy-rates'],
  queryFn: () => GetJPYRates(),
} satisfies QueryOptions;
