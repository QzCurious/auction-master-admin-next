import * as React from 'react';
import { havePermissions } from '@/api/helpers/havePermissions';
import { type Permission } from '@/api/permissions.data';
import { Chip, Typography } from '@mui/material';
import { Stack } from '@mui/system';

import RetryButton from './RetryButton';

export interface WithPermissionsOnlySectionProps {
  permissions: Permission[];
  children: () => React.ReactNode;
}

export default async function WithPermissionsOnlySection({ permissions, children }: WithPermissionsOnlySectionProps) {
  const permitted = await havePermissions(...permissions);

  if (permitted) {
    return <>{children()}</>;
  }

  return (
    <Stack alignItems="center" spacing={1}>
      <Typography variant="body1">You need following permissions to access this page:</Typography>
      <Stack alignItems="center" direction="row" spacing={1}>
        {permissions.map((permission) => (
          <Chip key={permission} label={permission} variant="outlined" />
        ))}
      </Stack>

      <RetryButton />
    </Stack>
  );
}
