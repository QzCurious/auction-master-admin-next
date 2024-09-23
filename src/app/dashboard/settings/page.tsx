import type { Metadata } from 'next';
import { UpdatePasswordForm } from '@/app/dashboard/settings/UpdatePasswordForm';
import { PermissionsGuard } from '@/domain/permission/havePermissions.server';
import { SITE_NAME } from '@/domain/static/static';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';

export const metadata = { title: `設定 | ${SITE_NAME}` } satisfies Metadata;

export default function Page() {
  return (
    <Stack spacing={3}>
      <div>
        <Typography component="h1" variant="h4">
          設定
        </Typography>
      </div>

      <PermissionsGuard permissions={['UpdateAdminPassword']}>
        <UpdatePasswordForm />
      </PermissionsGuard>
    </Stack>
  );
}
