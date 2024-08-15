'use client'

import React, { useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function AutoRefreshPage({ ms, children }: { ms: number; children: React.ReactNode }) {
  const router = useRouter();

  useEffect(() => {
    const id = setInterval(() => {
      router.refresh();
    }, ms);
    return () => clearInterval(id);
  }, [ms, router]);

  return <>{children}</>;
}
