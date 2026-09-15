'use client';

import type React from 'react';
import { useEffect, useTransition } from 'react';
import { useRouter } from 'next/navigation';
import { useSnackbar } from 'notistack';

import { signInDestination } from './navigation';

interface RedirectAuthErrorProps {
  message?: string;
  children?: React.ReactNode | ((isPending: boolean) => React.ReactNode);
}

export default function RedirectAuthError({ message = '請先登入', children }: RedirectAuthErrorProps) {
  const router = useRouter();
  const { enqueueSnackbar } = useSnackbar();
  const [isPending, startTransition] = useTransition();

  useEffect(() => {
    startTransition(() => {
      enqueueSnackbar(message, { variant: 'error', preventDuplicate: true });
      router.push(signInDestination(location.pathname + location.search));
    });
  }, [enqueueSnackbar, message, router]);

  if (typeof children === 'function') {
    return children(isPending);
  }

  return children;
}
