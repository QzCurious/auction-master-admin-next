'use client';

import type React from 'react';
import { useCallback, useEffect, useState } from 'react';

export function useUntil<T extends Date | null | undefined>(
  date: T,
  opts?: T extends Date
    ? { ms?: number }
    : {
        ms?: number;
        fallback?: boolean;
      }
) {
  const fallback = !!opts && 'fallback' in opts ? (opts.fallback ?? true) : true;
  const passed = useCallback(() => (date instanceof Date ? new Date() >= date : fallback), [date, fallback]);
  const [isPassed, setIsPassed] = useState(passed);

  useEffect(() => {
    setIsPassed(passed);
    const interval = setInterval(() => {
      setIsPassed(passed);
    }, opts?.ms ?? 1000);

    return () => clearInterval(interval);
  }, [opts?.ms, passed]);

  return isPassed;
}

export function Until({ date, children }: { date: Date; children: React.ReactNode }) {
  return useUntil(date) ? <>{children}</> : null;
}
