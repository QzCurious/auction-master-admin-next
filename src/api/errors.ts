export type ApiFailureKind = 'unauthenticated' | 'expired' | 'forbidden' | 'validation' | 'service';

/** Safe metadata only: never retain requests, response bodies, or credentials. */
export class ApiFailure extends Error {
  constructor(
    public readonly kind: ApiFailureKind,
    public readonly code = '9999',
    public readonly status?: number
  ) {
    super(`API ${kind} (${code})`);
    this.name = 'ApiFailure';
  }
}

export function decodeFailure(status: number, body: unknown): ApiFailure {
  const code =
    typeof body === 'object' &&
    body !== null &&
    'status' in body &&
    typeof body.status === 'object' &&
    body.status !== null &&
    'code' in body.status &&
    typeof body.status.code === 'string' &&
    /^\d{1,8}$/.test(body.status.code)
      ? body.status.code
      : '9999';
  if (status >= 500) return new ApiFailure('service', code, status);
  if (status === 401 && code === '1003') return new ApiFailure('expired', code, status);
  if (status === 403 || code === '1001') return new ApiFailure('forbidden', code, status);
  if (status === 401) return new ApiFailure('unauthenticated', code, status);
  if (status === 400 || status === 422 || code === '11') return new ApiFailure('validation', code, status);
  return new ApiFailure('service', code, status);
}

export class SessionRefreshRequired extends Error {
  constructor() {
    super('Session refresh requires a cookie-writable context');
  }
}
