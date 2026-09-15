import { createApiError, type ApiError } from '@/domain/api/ApiError';
import { QueryCache, QueryClient } from '@tanstack/react-query';

import { ActionResultError } from './actionResult';

export function createQueryClient(presentError: (error: ApiError) => void) {
  return new QueryClient({
    queryCache: new QueryCache({
      onError: (error) => presentError(error instanceof ActionResultError ? error.apiError : createApiError('9999')),
    }),
    defaultOptions: {
      queries: {
        staleTime: 10_000,
        retry: false,
        refetchIntervalInBackground: false,
      },
      mutations: { retry: false },
    },
  });
}
