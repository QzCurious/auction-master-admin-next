export const refreshAttemptParam = '__auth_retry';
export const returnPathHeader = 'x-api-return-path';

function hasUnsafeCharacters(value: string) {
  return [...value].some(
    (character) => character === '\\' || character.charCodeAt(0) <= 32 || character.charCodeAt(0) === 127
  );
}

/** Reject ambiguous URLs, external destinations, and auth routes that could loop. */
export function safeReturnPath(value: string | null | undefined): string {
  if (!value || !value.startsWith('/') || value.startsWith('//') || hasUnsafeCharacters(value)) return '/dashboard';
  let decoded: string;
  try {
    decoded = decodeURIComponent(value.split('?')[0]);
  } catch {
    return '/dashboard';
  }
  if (decoded.startsWith('//') || hasUnsafeCharacters(decoded)) return '/dashboard';
  const url = new URL(value, 'https://local.invalid');
  if (
    url.origin !== 'https://local.invalid' ||
    /^(?:\/auth|\/api|\/_next)(?:\/|$)/.test(url.pathname) ||
    /^(?:\/auth|\/api|\/_next)(?:\/|$)/.test(decoded)
  )
    return '/dashboard';
  return url.pathname + url.search;
}

export function refreshDestination(returnPath: string): string | undefined {
  const target = new URL(safeReturnPath(returnPath), 'https://local.invalid');
  if (target.searchParams.has(refreshAttemptParam)) return undefined;
  return `/auth/refresh?${new URLSearchParams({ goto: target.pathname + target.search })}`;
}

export function afterRefreshDestination(returnPath: string): string {
  const target = new URL(safeReturnPath(returnPath), 'https://local.invalid');
  target.searchParams.set(refreshAttemptParam, '1');
  return target.pathname + target.search;
}

export function signInDestination(returnPath: string): string {
  const target = new URL(safeReturnPath(returnPath), 'https://local.invalid');
  target.searchParams.delete(refreshAttemptParam);
  return `/auth/sign-in?${new URLSearchParams({ goto: target.pathname + target.search })}`;
}
