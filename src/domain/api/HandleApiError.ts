'use client';

import { useCallback, useEffect, useRef } from 'react';
import { redirect } from 'next/navigation';
import { type ApiError } from '@/domain/api/ApiError';
import { signInDestination } from '@/domain/auth/navigation';
import { useSnackbar } from 'notistack';

export function useHandleApiError() {
  const { enqueueSnackbar } = useSnackbar();

  return useCallback(
    (err: ApiError) => {
      if (err.type === 'toast') {
        enqueueSnackbar(err.message, { variant: 'error' });
        return;
      }
      if (err.type === 'redirect') {
        redirect(err.url === '/auth/sign-in' ? signInDestination(location.pathname + location.search) : err.url);
      }
      if (err.type === 'throw') {
        throw new Error(err.message);
      }
    },
    [enqueueSnackbar]
  );
}

export function HandleApiError({ error }: { error: ApiError }) {
  const done = useRef(false);
  const handleApiError = useHandleApiError();

  useEffect(() => {
    if (!done.current) {
      handleApiError(error);
      done.current = true;
    }
  }, [error, handleApiError]);

  return null;
}
