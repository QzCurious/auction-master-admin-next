import type { Metadata } from 'next';
import Link from 'next/link';
import { roles } from '@/api/backend/rbac/roles';
import Button from '@mui/material/Button';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import { Plus as PlusIcon } from '@phosphor-icons/react/dist/ssr/Plus';

import { config } from '@/config';
import { HavePermissionsOnly } from '@/contexts/UserContext';
import RedirectAuthError from '@/components/RedirectAuthError';
import WithoutPermissionsError from '@/components/WithoutPermissionsError/WithoutPermissionsError';

import { RoleTable } from './RoleTable';

export const metadata = { title: `角色列表 | Dashboard | ${config.site.name}` } satisfies Metadata;

export default async function Page() {
  return (
    <Stack spacing={3}>
      <Stack direction="row" spacing={3}>
        <Stack spacing={1} sx={{ flex: '1 1 auto' }}>
          <Typography variant="h4">角色列表</Typography>
        </Stack>

        <HavePermissionsOnly permissions={['CreateRole']}>
          <Button
            LinkComponent={Link}
            href="/dashboard/roles/create"
            startIcon={<PlusIcon fontSize="var(--icon-fontSize-md)" />}
            variant="contained"
          >
          新增
          </Button>
        </HavePermissionsOnly>
      </Stack>

      <Table />
    </Stack>
  );
}

async function Table() {
  const res = await roles();
  if (res.error === '1001') {
    return <WithoutPermissionsError permissions={['GetRoles']} />;
  }

  if (res.error === '1003') {
    return <RedirectAuthError />;
  }

  return <RoleTable rows={res.data.map((role) => ({ id: role.role, ...role })) ?? []} />;
}
