import { PERMISSION_MAP } from '@/domain/permission/permissions.data';
import { type PermissionKey } from '@/domain/permission/types';
import { Typography } from '@mui/material';
import { Stack } from '@mui/system';

import PermissionChip from './PermissionChip';
import RetryButton from './RetryButton';

interface WithPermissionsOnlySectionProps {
  permissions: PermissionKey[];
}

export default function WithoutPermissionsError({ permissions }: WithPermissionsOnlySectionProps) {
  return (
    <Stack alignItems="center" spacing={1} sx={{ p: 3 }}>
      <Typography variant="body1">你需要以下權限才能繼續</Typography>
      <Stack alignItems="center" direction="row" spacing={1}>
        {permissions
          .map((key) => PERMISSION_MAP[key].description)
          .map((permission) => (
            <PermissionChip key={permission} label={permission} />
          ))}
      </Stack>

      <RetryButton />
    </Stack>
  );
}
