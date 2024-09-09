import type { Metadata } from 'next';
import { GetItemsAndDetails } from '@/api/backend/items/GetItemsAndDetails';
import { ITEM_STATUS } from '@/api/backend/static-configs.data';
import { parseSearchParams } from '@/helper/parseSearchParams';
import { PAGE, ROWS_PER_PAGE } from '@/static';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import { Box } from '@mui/system';

import { config } from '@/config';
import AutoRefreshPage from '@/components/AutoRefreshPage';
import RedirectAuthError from '@/components/RedirectAuthError';
import RemoveSearchBtn from '@/components/RemoveSearchBtn';
import WithoutPermissionsError from '@/components/WithoutPermissionsError/WithoutPermissionsError';

import { ConsignorFilter } from './ConsignorFilter';
import { ItemTable } from './ItemTable';
import { PickForReturn, PickForReturnButtons } from './PickForReturn';
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
            {/* <DirectIdInput /> */}

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
  const query = parseSearchParams(SearchParamsSchema, searchParams);

  const [itemsRes] = await Promise.all([
    GetItemsAndDetails({
      status: (() => {
        if (query.picking === 'return') return [ITEM_STATUS.enum('WarehouseReturnPendingStatus')];
        return query.status;
      })(),
      limit: query[ROWS_PER_PAGE],
      offset: query[PAGE] * query[ROWS_PER_PAGE],
      consignorID: query.consignorID,
      sort: 'createdAt',
      order: 'desc',
    }),
  ]);

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
          <ConsignorFilter consignorID={query.consignorID} />
          {!query.picking && (
            <>
              <StatusFilter selected={query.status} statusCount={itemsRes.data.statusCounts} />
              <RemoveSearchBtn<keyof typeof query> fields={['consignorID', 'status']} />
            </>
          )}

          <Box mx="auto" />
          <PickForReturnButtons picking={query.picking} stage={query.stage} />
        </Stack>

        {query.picking === 'return' && !query.consignorID ? (
          '退貨請先鎖定寄售人'
        ) : (
          <ItemTable rows={itemsRes.data.items} count={itemsRes.data.count} query={query} />
        )}
      </Stack>

      <PickForReturn picking={query.picking} stage={query.stage} />
    </AutoRefreshPage>
  );
}
