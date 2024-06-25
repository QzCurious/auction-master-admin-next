import * as React from 'react';
import type { Metadata } from 'next';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';

import { config } from '@/config';
import { UpdatePasswordForm } from '@/components/dashboard/settings/update-password-form';

// import { Notifications } from '@/components/dashboard/settings/notifications';

export const metadata = { title: `設定 | ${config.site.name}` } satisfies Metadata;

export default function Page(): React.JSX.Element {
  return (
    <Stack spacing={3}>
      <div>
        <Typography component="h1" variant="h4">
          設定
        </Typography>
      </div>
      {/* <Notifications /> */}
      <UpdatePasswordForm />
    </Stack>
  );
}
