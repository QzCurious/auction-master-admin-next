import type { Metadata } from 'next';
import Link from 'next/link';
import { admins } from '@/api/backend/admins/admins';
import { configs } from '@/api/backend/configs';
import Button from '@mui/material/Button';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import { Plus as PlusIcon } from '@phosphor-icons/react/dist/ssr/Plus';

import { config } from '@/config';
import { HavePermissionsOnly } from '@/contexts/UserContext';
import RedirectAuthError from '@/components/RedirectAuthError';
import WithoutPermissionsError from '@/components/WithoutPermissionsError/WithoutPermissionsError';

import { AdminTable } from './AdminTable';

export const metadata = { title: `Roles | Dashboard | ${config.site.name}` } satisfies Metadata;

interface PageProps {
  searchParams: { rowsPerPage?: string; page?: string };
}

export default async function Page(pageProps: PageProps) {
  return (
    <Stack spacing={3}>
      <Stack direction="row" spacing={3}>
        <Stack spacing={1} sx={{ flex: '1 1 auto' }}>
          <Typography variant="h4">管理員列表</Typography>
        </Stack>

        <HavePermissionsOnly permissions={['CreateAdmin']}>
          <Button
            LinkComponent={Link}
            href="/dashboard/admins/create"
            startIcon={<PlusIcon fontSize="var(--icon-fontSize-md)" />}
            variant="contained"
          >
            新增
          </Button>
        </HavePermissionsOnly>
      </Stack>

      <Table {...pageProps} />
    </Stack>
  );
}

async function Table({ searchParams: { rowsPerPage = '10', page = '0' } }: PageProps) {
  const limit = Number.isNaN(Number(rowsPerPage)) ? 10 : Number(rowsPerPage);
  const offset = Number.isNaN(Number(page)) ? 0 : Number(page) * limit;
  const [adminRes, configsRes] = await Promise.all([admins({ limit, offset }), configs()]);

  if (adminRes.error === '1001' || configsRes.error === '1001') {
    return <WithoutPermissionsError permissions={['GetAdmins', 'GetBackendConfigs']} />;
  }

  if (adminRes.error === '1003' || configsRes.error === '1003') {
    return <RedirectAuthError />;
  }

  return (
    <AdminTable rows={adminRes.data.admins} count={adminRes.data.count} adminStatus={configsRes.data.adminStatus} />
  );
}
