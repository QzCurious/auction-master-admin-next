import type { Metadata } from 'next';
import Link from 'next/link';
import { GetRoles } from '@/api/backend/rbac/GetRoles';
import { HavePermissionsOnly } from '@/domain/permission/HavePermissionsOnly';
import { SITE_NAME } from '@/domain/static/static';
import Button from '@mui/material/Button';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import { Plus as PlusIcon } from '@phosphor-icons/react/dist/ssr/Plus';

import RedirectAuthError from '@/domain/auth/RedirectAuthError';
import WithoutPermissionsError from '@/domain/permission/WithoutPermissionsError/WithoutPermissionsError';

import { RoleTable } from './RoleTable';

export const metadata = { title: `角色列表 | ${SITE_NAME}` } satisfies Metadata;

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

      <section>
        <Table />
      </section>
    </Stack>
  );
}

async function Table() {
  const res = await GetRoles();
  if (res.error === '1001') {
    return <WithoutPermissionsError permissions={['GetRoles']} />;
  }

  if (res.error === '1003') {
    return <RedirectAuthError />;
  }

  return <RoleTable rows={res.data.map((role) => ({ id: role.role, ...role })) ?? []} />;
}
