import { type ApiError } from '@/domain/api/ApiError';

/** Uses the existing UI error shape for missing or invalid local credentials. */
export const invalidSessionError = {
  code: '1003',
  type: 'redirect',
  url: '/auth/sign-in',
} satisfies ApiError;
