import type { Metadata } from 'next';
import Link from 'next/link';
import { GetAdmins } from '@/api/backend/admins/GetAdmins';
import { HavePermissionsOnly } from '@/domain/permission/HavePermissionsOnly';
import { parseSearchParams } from '@/domain/crud/parseSearchParams';
import { PAGE, ROWS_PER_PAGE, SITE_NAME } from '@/domain/static/static';
import { Button, Stack } from '@mui/material';
import Typography from '@mui/material/Typography';
import { Plus as PlusIcon } from '@phosphor-icons/react/dist/ssr/Plus';

import RedirectAuthError from '@/domain/auth/RedirectAuthError';
import WithoutPermissionsError from '@/domain/permission/WithoutPermissionsError/WithoutPermissionsError';

import { AdminTable } from './AdminTable';
import { SearchParamsSchema } from './SearchParamsSchema';

export const metadata = { title: `管理員列表 | ${SITE_NAME}` } satisfies Metadata;

interface PageProps {
  searchParams: Record<string, string | string[] | undefined>;
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

      <section>
        <Table {...pageProps} />
      </section>
    </Stack>
  );
}

async function Table({ searchParams }: PageProps) {
  const filters = parseSearchParams(SearchParamsSchema, searchParams);
  const [adminRes] = await Promise.all([
    GetAdmins({
      limit: filters[ROWS_PER_PAGE],
      offset: filters[PAGE] * filters[ROWS_PER_PAGE],
    }),
  ]);

  if (adminRes.error === '1001') {
    return <WithoutPermissionsError permissions={['GetAdmins']} />;
  }

  if (adminRes.error === '1003') {
    return <RedirectAuthError />;
  }

  return <AdminTable rows={adminRes.data.admins} count={adminRes.data.count} />;
}
