import type { Metadata } from 'next';
import { AdminGetConsignor } from '@/api/backend/consignor/AdminGetConsignor';
import { AdminGetConsignors } from '@/api/backend/consignor/AdminGetConsignors';
import RedirectAuthError from '@/domain/auth/RedirectAuthError';
import { ConsignorFilter } from '@/domain/crud/ConsignorFilter';
import { parseSearchParams } from '@/domain/crud/parseSearchParams';
import RemoveSearchBtn from '@/domain/crud/RemoveSearchBtn';
import { havePermissions, PermissionsGuard } from '@/domain/permission/havePermissions.server';
import WithoutPermissionsError from '@/domain/permission/WithoutPermissionsError/WithoutPermissionsError';
import { PAGE, ROWS_PER_PAGE, SITE_NAME } from '@/domain/static/static';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import { Box } from '@mui/system';

import { ConsignorTable } from './ConsignorTable';
import { SearchParamsSchema } from './SearchParamsSchema';

export const metadata = { title: `寄售人列表 | ${SITE_NAME}` } satisfies Metadata;

interface PageProps {
  searchParams: Record<string, string | string[] | undefined>;
}

export default async function Page(pageProps: PageProps) {
  return (
    <Stack spacing={3}>
      <Stack direction="row" spacing={3}>
        <Stack spacing={1} sx={{ flex: '1 1 auto' }}>
          <Typography variant="h4">寄售人列表</Typography>
        </Stack>
      </Stack>

      <PermissionsGuard permissions={['AdminGetConsignors']}>
        <section>
          <Table {...pageProps} />
        </section>
      </PermissionsGuard>
    </Stack>
  );
}

async function Table({ searchParams }: PageProps) {
  const filters = parseSearchParams(SearchParamsSchema, searchParams);
  if (filters.consignorID && !(await havePermissions(['AdminGetConsignor']))) {
    return <WithoutPermissionsError permissions={['AdminGetConsignor']} />;
  }

  const [consignorsRes, consignorRes] = await Promise.all([
    !filters.consignorID
      ? AdminGetConsignors({
          sort: 'createdAt',
          order: 'desc',
          limit: filters[ROWS_PER_PAGE],
          offset: filters[PAGE] * filters[ROWS_PER_PAGE],
        })
      : null,
    filters.consignorID ? AdminGetConsignor(filters.consignorID) : null,
  ]);

  if (consignorsRes?.error === '1001' || consignorRes?.error === '1001') {
    return <WithoutPermissionsError permissions={['AdminGetConsignors']} />;
  }

  if (consignorsRes?.error === '1003' || consignorRes?.error === '1003') {
    return <RedirectAuthError />;
  }

  return (
    <Stack spacing={3}>
      <Stack direction="row" flexWrap="wrap" gap={2}>
        <ConsignorFilter consignorID={filters.consignorID} />
        <RemoveSearchBtn<keyof typeof filters> fields={['consignorID']} />

        <Box mx="auto" />
      </Stack>

      {consignorsRes && <ConsignorTable rows={consignorsRes.data.consignors} count={consignorsRes.data.count} />}
      {consignorRes && <ConsignorTable rows={[consignorRes.data]} count={1} />}
    </Stack>
  );
}
