'use client';

import React, { useEffect, useSyncExternalStore, useTransition } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { shouldPoll } from '@/domain/data/polling';

const subscribe = (cb: () => void) => {
  const controller = new AbortController();
  if (typeof document !== 'undefined') {
    document.addEventListener('visibilitychange', cb, { signal: controller.signal });
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
  const searchParams = useSearchParams();
  const picking = searchParams.has('picking') || searchParams.has('stage');

  useEffect(() => {
    if (!isWindowVisible || isPending || picking) return;

    const id = setInterval(() => {
      const editing =
        !!document.querySelector('[role="dialog"]') ||
        !!document.activeElement?.matches('input, textarea, select, [contenteditable="true"]');
      if (!shouldPoll({ visible: document.visibilityState === 'visible', pending: isPending, editing, picking }))
        return;
      startTransition(() => {
        if (process.env.NODE_ENV === 'development') console.trace('refetch');
        router.refresh();
      });
    }, ms);
    return () => clearInterval(id);
  }, [isWindowVisible, isPending, picking, ms, router]);

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
