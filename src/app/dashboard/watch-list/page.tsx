import { type Metadata } from 'next';
import { GetAuctionItems } from '@/api/backend/auction-items/GetAuctionItems';
import { HandleApiError } from '@/domain/api/HandleApiError';
import { AuctionIdFilter } from '@/domain/crud/AuctionIdFilter';
import { ConsignorFilter } from '@/domain/crud/ConsignorFilter';
import { parseSearchParams } from '@/domain/crud/parseSearchParams';
import RemoveSearchBtn from '@/domain/crud/RemoveSearchBtn';
import { PermissionsGuard } from '@/domain/permission/havePermissions.server';
import { PAGE, ROWS_PER_PAGE, SITE_NAME } from '@/domain/static/static';
import { AUCTION_ITEM_STATUS } from '@/domain/static/static-config-mappers';
import { AutoRefreshEffect } from '@/helper/useAutoRefresh';
import { Box } from '@mui/material';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import { Provider } from 'jotai';

import { AuctionItemTable } from './AuctionItemTable';
import { SearchParamsSchema } from './SearchParamsSchema';

export const metadata = { title: `盯標列表 | ${SITE_NAME}` } satisfies Metadata;

interface PageProps {
  searchParams: Record<string, string | string[] | undefined>;
}

export default async function Page(pageProps: PageProps) {
  return (
    <Stack spacing={3}>
      <Stack direction="row" spacing={3}>
        <Stack spacing={2} direction="row" justifyContent="space-between" sx={{ flex: '1 1 auto' }}>
          <Typography variant="h4" sx={{ flexShrink: 0 }}>
            盯標列表
          </Typography>
        </Stack>
      </Stack>

      <PermissionsGuard permissions={['GetAuctionItems']}>
        <section>
          <Content {...pageProps} />
        </section>
      </PermissionsGuard>
    </Stack>
  );
}

async function Content({ searchParams }: PageProps) {
  const filters = parseSearchParams(SearchParamsSchema, searchParams);

  const [auctionItemsRes] = await Promise.all([
    GetAuctionItems({
      auctionId: filters.auctionId,
      consignorId: filters.consignorId,
      status: [
        AUCTION_ITEM_STATUS.enum('InitStatus'),
        AUCTION_ITEM_STATUS.enum('StopBiddingStatus'),
        AUCTION_ITEM_STATUS.enum('HighestBiddedStatus'),
        AUCTION_ITEM_STATUS.enum('NotHighestBiddedStatus'),
      ],
      sort: 'closeAt',
      order: 'asc',
      limit: filters[ROWS_PER_PAGE],
      offset: filters[PAGE] * filters[ROWS_PER_PAGE],
    }),
  ]);

  if (auctionItemsRes.error) {
    return <HandleApiError error={auctionItemsRes.error} />;
  }

  return (
    <Provider>
      <AutoRefreshEffect ms={10_000} />
      <Stack spacing={3}>
        <Stack direction="row" flexWrap="wrap" gap={2}>
          <ConsignorFilter consignorId={filters.consignorId} />
          <AuctionIdFilter values={filters.auctionId} />
          <RemoveSearchBtn<keyof typeof filters> fields={['consignorId', 'auctionId']} />

          <Box mx="auto" />
        </Stack>

        <AuctionItemTable rows={auctionItemsRes.data.auctionItems} count={auctionItemsRes.data.count} />
      </Stack>
    </Provider>
  );
}
