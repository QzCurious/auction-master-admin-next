import { type ApiError } from '@/domain/api/ApiError';

// Browser-safe action failures retain the adapter's existing backend code and
// presentation mapping; HTTP operations still throw native Ky errors.
export class ActionResultError extends Error {
  constructor(readonly apiError: ApiError) {
    super('message' in apiError ? apiError.message : 'Authentication required');
    this.name = 'ActionResultError';
  }
}
export async function requireActionSuccess<T extends { error?: ApiError }>(result: Promise<T>): Promise<T> {
  const response = await result;
  if (response.error) throw new ActionResultError(response.error);
  return response;
}
