'use client';

import { useTransition } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@mui/material';

import { refreshTokenAction } from './actions';

export default function RetryButton() {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  return (
    <Button
      color="primary"
      onClick={async () => {
        startTransition(async () => {
          await refreshTokenAction();
          router.refresh();
        });
      }}
      sx={{ mt: 1 }}
      variant="contained"
      disabled={isPending}
    >
      Retry
    </Button>
  );
}
