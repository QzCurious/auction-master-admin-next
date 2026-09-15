import { type ApiError } from './core/ApiError/createApiErrorServerSide';

/** Uses the existing UI error shape for missing or invalid local credentials. */
export const invalidSessionError = {
  code: '1003',
  type: 'redirect',
  url: '/auth/sign-in',
} satisfies ApiError;
