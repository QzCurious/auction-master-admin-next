import type { Metadata } from 'next';
import { AdminGetConsignor } from '@/api/backend/consignor/AdminGetConsignor';
import { AdminGetConsignors } from '@/api/backend/consignor/AdminGetConsignors';
import { parseSearchParams } from '@/helper/parseSearchParams';
import { PAGE, ROWS_PER_PAGE } from '@/static';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import { Box } from '@mui/system';

import { config } from '@/config';
import RedirectAuthError from '@/components/RedirectAuthError';
import RemoveSearchBtn from '@/components/RemoveSearchBtn';
import WithoutPermissionsError from '@/components/WithoutPermissionsError/WithoutPermissionsError';

import { ConsignorFilter } from '../items/ConsignorFilter';
import { ConsignorTable } from './ConsignorTable';
import { SearchParamsSchema } from './SearchParamsSchema';

export const metadata = { title: `寄售人列表 | ${config.site.name}` } satisfies Metadata;

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

      <section>
        <Table {...pageProps} />
      </section>
    </Stack>
  );
}

async function Table({ searchParams }: PageProps) {
  const filters = parseSearchParams(SearchParamsSchema, searchParams);

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
