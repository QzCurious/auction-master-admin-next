import { useMemo, useRef } from 'react';

export function useStableCallback<T extends (...args: any[]) => any>(fn: T | undefined): T {
  const ref = useRef(fn);
  ref.current = fn;
  return useMemo(() => ((...args: Parameters<T>) => ref.current?.(...args)) as T, []);
}
