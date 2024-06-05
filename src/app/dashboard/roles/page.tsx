import type { Metadata } from 'next';
import Link from 'next/link';
import { roles } from '@/api/backend/rbac/roles';
import { havePermissions } from '@/api/helpers/havePermissions';
import { redirectAuthError } from '@/app/utils/redirectAuthError';
import Button from '@mui/material/Button';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import { Plus as PlusIcon } from '@phosphor-icons/react/dist/ssr/Plus';

import { config } from '@/config';
import WithPermissionsOnlySection from '@/components/WithPermissionsOnlySection/WithPermissionsOnlySection';

import { RoleTable } from './RoleTable';

export const metadata = { title: `Roles | Dashboard | ${config.site.name}` } satisfies Metadata;

export default async function Page() {
  const res = await roles();
  redirectAuthError(res);

  return (
    <Stack spacing={3}>
      <Stack direction="row" spacing={3}>
        <Stack spacing={1} sx={{ flex: '1 1 auto' }}>
          <Typography variant="h4">Roles</Typography>
        </Stack>

        {(await havePermissions('CreateAdmin')) && (
          <Button
            LinkComponent={Link}
            href="/dashboard/roles/create"
            startIcon={<PlusIcon fontSize="var(--icon-fontSize-md)" />}
            variant="contained"
          >
            Add
          </Button>
        )}
      </Stack>

      <WithPermissionsOnlySection permissions={['GetRoles']}>
        {() => <RoleTable rows={res.data.map((role) => ({ id: role.role, ...role })) ?? []} />}
      </WithPermissionsOnlySection>
    </Stack>
  );
}
