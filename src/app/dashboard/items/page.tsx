import type { Metadata } from 'next';
import { GetItemsAndDetails } from '@/api/backend/items/GetItemsAndDetails';
import RedirectAuthError from '@/domain/auth/RedirectAuthError';
import { parseSearchParams } from '@/domain/crud/parseSearchParams';
import RemoveSearchBtn from '@/domain/crud/RemoveSearchBtn';
import { PermissionsGuard } from '@/domain/permission/havePermissions.server';
import { HavePermissionsOnly } from '@/domain/permission/HavePermissionsOnly';
import WithoutPermissionsError from '@/domain/permission/WithoutPermissionsError/WithoutPermissionsError';
import { PAGE, ROWS_PER_PAGE, SITE_NAME } from '@/domain/static/static';
import { ITEM_STATUS } from '@/domain/static/static-config-mappers';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import { Box } from '@mui/system';
import { Provider } from 'jotai';

import { AutoRefreshEffect } from '@/helper/useAutoRefresh';

import { ConsignorFilter } from '../../../domain/crud/ConsignorFilter';
import { ItemTable } from './ItemTable';
import { PickForReturn, PickForReturnButtons } from './PickForReturn';
import { SearchParamsSchema } from './SearchParamsSchema';
import { StatusFilter } from './StatusFilter';

export const metadata = { title: `物品列表 | ${SITE_NAME}` } satisfies Metadata;

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
          </Stack>
        </Stack>
      </Stack>

      <PermissionsGuard permissions={['GetItemsAndDetails']}>
        <section>
          <Content {...pageProps} />
        </section>
      </PermissionsGuard>
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
      consignorId: query.consignorId,
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
    <Provider>
      <AutoRefreshEffect ms={10_000} />
      <Stack spacing={3}>
        <Stack direction="row" flexWrap="wrap" gap={2}>
          <ConsignorFilter consignorId={query.consignorId} />
          {!query.picking && (
            <>
              <StatusFilter selected={query.status} statusCount={itemsRes.data.statusCounts} />
              <RemoveSearchBtn<keyof typeof query> fields={['consignorId', 'status']} />
            </>
          )}

          <Box mx="auto" />

          <HavePermissionsOnly permissions={['AdminGetConsignor', 'AdminGetConsignors', 'ItemReturning']}>
            <PickForReturnButtons picking={query.picking} stage={query.stage} />
          </HavePermissionsOnly>
        </Stack>

        {query.picking === 'return' && !query.consignorId ? (
          '退貨請先鎖定寄售人'
        ) : (
          <ItemTable rows={itemsRes.data.items} count={itemsRes.data.count} query={query} />
        )}
      </Stack>

      <PickForReturn picking={query.picking} stage={query.stage} />
    </Provider>
  );
}
