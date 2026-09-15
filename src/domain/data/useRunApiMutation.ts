'use client';

import { createApiError, type ApiError } from '@/domain/api/ApiError';
import { useMutation, useQueryClient, type QueryKey } from '@tanstack/react-query';

import { ActionResultError, requireActionSuccess } from './actionResult';

export function useRunApiMutation() {
  const client = useQueryClient();
  const mutation = useMutation({
    mutationFn: ({ action }: { queryKeys: readonly QueryKey[]; action: () => Promise<{ error?: ApiError }> }) =>
      requireActionSuccess(action()),
    retry: false,
    onSuccess: async (_, { queryKeys }) => {
      await Promise.all(queryKeys.map((queryKey) => client.invalidateQueries({ queryKey })));
    },
  });

  // Compatibility with existing forms: TanStack records the failure first,
  // then the caller receives its familiar result for inline/toast handling.
  return async function runApiMutation<T extends { error?: ApiError }>(
    queryKeys: readonly QueryKey[],
    action: () => Promise<T>
  ): Promise<T | { data: null; error: ApiError }> {
    try {
      return (await mutation.mutateAsync({ queryKeys, action })) as T;
    } catch (error) {
      return { data: null, error: error instanceof ActionResultError ? error.apiError : createApiError('9999') };
    }
  };
}
