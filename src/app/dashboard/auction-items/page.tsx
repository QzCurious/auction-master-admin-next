import { type Metadata } from 'next';
import { GetAuctionItems } from '@/api/backend/auction-items/GetAuctionItems';
import { AUCTION_ITEM_STATUS } from '@/api/backend/static-configs.data';
import { GetActivationWorkers } from '@/api/backend/workers/GetActivationWorkers';
import { PAGE, parseSearchParams, ROWS_PER_PAGE } from '@/static';
import { Box } from '@mui/material';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import { Provider } from 'jotai';

import { config } from '@/config';
import AutoRefreshPage from '@/components/AutoRefreshPage';
import RedirectAuthError from '@/components/RedirectAuthError';
import RemoveSearchBtn from '@/components/RemoveSearchBtn';
import WithoutPermissionsError from '@/components/WithoutPermissionsError/WithoutPermissionsError';

import { AuctionItemTable } from './AuctionItemTable';
import { ConsignorFilter } from './ConsignorFilter';
import { PickForFeePaid, PickForFeePaidButtons } from './PickForFeePaid';
import { PickForShipping, PickForShippingButtons } from './PickForShipping';
import { SearchParamsSchema } from './SearchParamsSchema';
import { StatusFilter } from './StatusFilter';

export const metadata = { title: `日拍競標商品列表 | ${config.site.name}` } satisfies Metadata;

interface PageProps {
  searchParams: Record<string, string | string[] | undefined>;
}

export default async function Page(pageProps: PageProps) {
  return (
    <Stack spacing={3}>
      <Stack direction="row" spacing={3}>
        <Stack spacing={2} direction="row" justifyContent="space-between" sx={{ flex: '1 1 auto' }}>
          <Typography variant="h4" sx={{ flexShrink: 0 }}>
            日拍競標商品列表
          </Typography>
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

  const [auctionItemsRes, activeWorkersRes] = await Promise.all([
    GetAuctionItems({
      consignorID: filters.consignorID,
      status: (() => {
        if (filters.picking === 'shipping') return [AUCTION_ITEM_STATUS.enum('ClosedStatus')];
        if (filters.picking === 'fee') return [AUCTION_ITEM_STATUS.enum('AwaitingConsignorPayFeeStatus')];
        if (filters.status.length) return filters.status;
        return [
          AUCTION_ITEM_STATUS.enum('InitStatus'),
          AUCTION_ITEM_STATUS.enum('StopBiddingStatus'),
          AUCTION_ITEM_STATUS.enum('HighestBiddedStatus'),
          AUCTION_ITEM_STATUS.enum('NotHighestBiddedStatus'),
          AUCTION_ITEM_STATUS.enum('ClosedStatus'),
          AUCTION_ITEM_STATUS.enum('AwaitingConsignorPayFeeStatus'),
          AUCTION_ITEM_STATUS.enum('ConsignorRequestCancellationStatus'),
        ];
      })(),
      sort: 'createdAt',
      order: 'desc',
      limit: filters[ROWS_PER_PAGE],
      offset: filters[PAGE] * filters[ROWS_PER_PAGE],
    }),
    GetActivationWorkers(),
  ]);

  if (auctionItemsRes.error === '1001' || activeWorkersRes.error === '1001') {
    return <WithoutPermissionsError permissions={['GetAuctionItems', 'GetActivationWorkers']} />;
  }

  if (auctionItemsRes.error === '1003' || activeWorkersRes.error === '1003') {
    return <RedirectAuthError />;
  }

  return (
    <Provider>
      <AutoRefreshPage ms={10_000}>
        <Stack spacing={3}>
          <Stack direction="row" flexWrap="wrap" gap={2}>
            <ConsignorFilter consignorID={filters.consignorID} />
            {!filters.picking && (
              <>
                <StatusFilter selected={filters.status} />
                <RemoveSearchBtn<keyof typeof filters> fields={['consignorID', 'status']} />
              </>
            )}

            <Box mx="auto" />
            <PickForShippingButtons picking={filters.picking} stage={filters.stage} />
            <PickForFeePaidButtons picking={filters.picking} stage={filters.stage} />
          </Stack>

          <AuctionItemTable
            rows={auctionItemsRes.data.auctionItems}
            count={auctionItemsRes.data.count}
            activationWorkers={activeWorkersRes.data}
          />
        </Stack>

        <PickForShipping picking={filters.picking} stage={filters.stage} />
        <PickForFeePaid picking={filters.picking} stage={filters.stage} />
      </AutoRefreshPage>
    </Provider>
  );
}
