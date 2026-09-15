'use client';

import React, { useEffect, useSyncExternalStore, useTransition } from 'react';
import { useRouter } from 'next/navigation';

const subscribe = (cb: () => void) => {
  const controller = new AbortController();
  if (typeof window !== 'undefined' && window.addEventListener) {
    window.addEventListener('visibilitychange', cb, { signal: controller.signal });
  }
  return () => controller.abort();
};

export function useAutoRefresh(ms: number) {
  const isWindowVisible = useSyncExternalStore(
    subscribe,
    () => document.visibilityState === 'visible',
    () => false
  );
  const [isPending, startTransition] = useTransition();
  const router = useRouter();

  useEffect(() => {
    if (!isWindowVisible) return;

    const id = setInterval(() => {
      startTransition(() => {
        if (process.env.NODE_ENV === 'development') console.trace('refetch');
        router.refresh();
      });
    }, ms);
    return () => clearInterval(id);
  }, [isWindowVisible, ms, router]);

  return [isPending];
}

export function AutoRefreshEffect({
  ms,
  children,
}: {
  ms: number;
  children?: React.ReactNode | ((isPending: boolean) => React.ReactNode);
}) {
  const [isPending] = useAutoRefresh(ms);

  if (typeof children === 'function') {
    return children(isPending);
  }

  return <>{children}</>;
}
