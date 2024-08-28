import type { Metadata } from 'next';
import { GetItemsAndDetails } from '@/api/backend/items/GetItemsAndDetails';
import { PAGE, parseSearchParams, ROWS_PER_PAGE } from '@/static';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';

import { config } from '@/config';
import AutoRefreshPage from '@/components/AutoRefreshPage';
import RedirectAuthError from '@/components/RedirectAuthError';
import RemoveSearchBtn from '@/components/RemoveSearchBtn';
import WithoutPermissionsError from '@/components/WithoutPermissionsError/WithoutPermissionsError';

import { ConsignorFilter } from './ConsignorFilter';
import DirectIdInput from './DirectIdInput';
import { ItemTable } from './ItemTable';
import { SearchParamsSchema } from './SearchParamsSchema';
import { StatusFilter } from './StatusFilter';

export const metadata = { title: `物品列表 | ${config.site.name}` } satisfies Metadata;

interface PageProps {
  searchParams: Record<string, string | string[] | undefined>;
}

export default async function Page(pageProps: PageProps) {
  return (
    <Stack spacing={3}>
      <Stack direction="row" spacing={3}>
        <Stack spacing={2} direction="row" justifyContent="space-between" sx={{ flex: '1 1 auto' }}>
          <Typography variant="h4" sx={{ flexShrink: 0 }}>
            物品列表
          </Typography>

          <Stack direction="row" spacing={1}>
            <DirectIdInput />

            {/* <Button
              LinkComponent={Link}
              href="/dashboard/items/create"
              startIcon={<PlusIcon fontSize="var(--icon-fontSize-md)" />}
              variant="contained"
            >
              新增
            </Button> */}
          </Stack>
        </Stack>
      </Stack>

      <section>
        <Content {...pageProps} />
      </section>
    </Stack>
  );
}

async function Content({ searchParams }: PageProps) {
  const filters = parseSearchParams(SearchParamsSchema, searchParams);

  const itemsRes = await GetItemsAndDetails({
    status: filters.status,
    limit: filters[ROWS_PER_PAGE],
    offset: filters[PAGE] * filters[ROWS_PER_PAGE],
    consignorID: filters.consignorID,
    sort: 'createdAt',
    order: 'desc',
  });

  if (itemsRes.error === '1001') {
    return <WithoutPermissionsError permissions={['GetItemsAndDetails']} />;
  }

  if (itemsRes.error === '1003') {
    return <RedirectAuthError />;
  }

  return (
    <AutoRefreshPage ms={10_000}>
      <Stack spacing={3}>
        <Stack direction="row" flexWrap="wrap" gap={2}>
          <ConsignorFilter consignorID={filters.consignorID} />
          <StatusFilter selected={filters.status} statusCount={itemsRes.data.statusCounts} />
          <RemoveSearchBtn<keyof typeof filters> fields={['consignorID', 'status']} />
        </Stack>

        <ItemTable rows={itemsRes.data.items} count={itemsRes.data.count} />
      </Stack>
    </AutoRefreshPage>
  );
}
