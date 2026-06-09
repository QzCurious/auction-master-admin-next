'use client';

import { useTransition } from 'react';
import refreshTokenAction from '@/domain/auth/refreshTokenAction';
import { Button } from '@mui/material';

export default function RetryButton() {
  const [isPending, startTransition] = useTransition();

  return (
    <Button
      color="primary"
      onClick={async () => {
        startTransition(async () => {
          await refreshTokenAction();
        });
      }}
      sx={{ mt: 1 }}
      variant="contained"
      disabled={isPending}
    >
      再試一次
    </Button>
  );
}
