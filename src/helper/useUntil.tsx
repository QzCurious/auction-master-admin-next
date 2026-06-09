'use client';

import type React from 'react';
import { useCallback, useEffect, useMemo, useReducer } from 'react';

/**
 * Why onFalsy is required when date is falsy:
 * ```typescript
 * const expired = useUntil(date, { onFalsy: false });
 * const passed = useUntil(date, { onFalsy: true });
 * ```
 */
type useUntilParams<T extends string | Date | null | undefined> = [T] extends [NonNullable<T>]
  ? [date: T, opts?: { ms?: number }]
  : [date: T, opts: { ms?: number; onFalsy: boolean }];

export function useUntil<T extends string | Date | null | undefined>(...[date, opts]: useUntilParams<T>): boolean {
  if (!date && !opts) throw new TypeError('opts.onFalsy is required when date is falsy');

  const [, forceRerender] = useReducer(() => ({}), {});
  const onFalsy = !!opts && 'onFalsy' in opts ? opts.onFalsy : true;
  const _date = useMemo(() => (date instanceof Date ? date : typeof date === 'string' ? new Date(date) : null), [date]);
  const check = useCallback(() => (_date ? _date <= new Date() : onFalsy), [_date, onFalsy]);
  const isUntil = check();

  useEffect(() => {
    if (check()) return;
    const interval = setInterval(() => {
      if (check()) {
        forceRerender();
        clearInterval(interval);
      }
    }, opts?.ms ?? 1000);

    return () => clearInterval(interval);
  }, [check, opts?.ms]);

  return isUntil;
}

type UntilProps<T extends string | Date | null | undefined> = [T] extends [NonNullable<T>]
  ? { date: T; opts?: { ms?: number } }
  : { date: T; opts: { ms?: number; onFalsy: boolean } };

export function Until<T extends string | Date | null | undefined>({
  date,
  opts,
  children,
}: UntilProps<T> & {
  children: React.ReactNode;
}) {
  // @ts-expect-error cannot type this generic well
  return useUntil(date, opts) ? (
    //
    <>{children}</>
  ) : null;
}
