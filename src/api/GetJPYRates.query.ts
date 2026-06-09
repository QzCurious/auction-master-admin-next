import { type QueryOptions } from '@tanstack/react-query';

import { GetJPYRates } from './GetJPYRates';

export const GetJPYRatesQueryOptions = {
  queryKey: ['jpy-rates'],
  queryFn: () => GetJPYRates(),
} satisfies QueryOptions;
