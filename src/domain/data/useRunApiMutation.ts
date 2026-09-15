'use client';

import { createApiError, type ApiError } from '@/domain/api/ApiError';
import { useMutation, useQueryClient } from '@tanstack/react-query';

import { ActionResultError, requireActionSuccess } from './actionResult';
import { affectsQuery, type MutationName } from './freshness';

export function useRunApiMutation() {
  const client = useQueryClient();
  const mutation = useMutation({
    mutationFn: ({ action }: { name: MutationName; action: () => Promise<{ error?: ApiError }> }) =>
      requireActionSuccess(action()),
    retry: false,
    onSuccess: async (_, { name }) => {
      await client.invalidateQueries({ predicate: (query) => affectsQuery(name, query.queryKey) });
    },
  });

  // Compatibility with existing forms: TanStack records the failure first,
  // then the caller receives its familiar result for inline/toast handling.
  return async function runApiMutation<T extends { error?: ApiError }>(
    name: MutationName,
    action: () => Promise<T>
  ): Promise<T | { data: null; error: ApiError }> {
    try {
      return (await mutation.mutateAsync({ name, action })) as T;
    } catch (error) {
      return { data: null, error: error instanceof ActionResultError ? error.apiError : createApiError('9999') };
    }
  };
}
