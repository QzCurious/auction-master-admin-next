'use client';

import { Alert, AlertTitle, Button } from '@mui/material';

export default function ErrorPage({ error, reset }: { error: Error & { digest?: string }; reset: () => void }) {
  return (
    <Alert severity="error">
      <AlertTitle>Error</AlertTitle>
      Some error occurred, please{' '}
      <Button type="button" sx={{ p: 0 }} variant="text" size="small" onClick={reset}>
        try again
      </Button>{' '}
      or report it to engineers with digest code: <code>{error.digest}</code>.
    </Alert>
  );
}
