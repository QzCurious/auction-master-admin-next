import { type ApiError } from '@/api/core/ApiError/createApiErrorServerSide';

import { type Permissions } from './evaluatePermissions';

/** Interpret only the existing backend codes; a service failure is never an empty grant set. */
export function permissionResult(result: { data: Permissions | null; error?: ApiError }) {
  if (result.data) return { kind: 'loaded' as const, permissions: result.data };
  if (result.error?.code === '1003') return { kind: 'unauthenticated' as const };
  if (result.error?.code === '1001') return { kind: 'forbidden' as const };
  return { kind: 'unavailable' as const };
}
