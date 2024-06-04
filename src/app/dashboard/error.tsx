'use client';

import { NOT_SIGN_IN_ERROR, PERMISSION_DENIED_ERROR } from '@/api/Errors';
import { useRouter } from 'next/navigation';
import { useSnackbar } from 'notistack';
import { useEffect } from 'react';

export default function ErrorPage({ error, reset }: { error: Error & { digest?: string }; reset: () => void }) {
  const router = useRouter();
  const { enqueueSnackbar } = useSnackbar();

  useEffect(() => {
    if (error.message === NOT_SIGN_IN_ERROR) {
      enqueueSnackbar('Please sign in first', { variant: 'error', preventDuplicate: true });
      router.push('/auth/sign-in');
      return;
    }
    if (error.message === PERMISSION_DENIED_ERROR) {
      enqueueSnackbar('Permission denied', { variant: 'error', preventDuplicate: true });
      router.push('/dashboard');
      return;
    }

    enqueueSnackbar(error.message, { variant: 'error' });
  }, [enqueueSnackbar, error, router]);

  return null;
}
