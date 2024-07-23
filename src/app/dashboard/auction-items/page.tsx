import type { Metadata } from 'next';
import { AUCTION_ITEM_STATUS_MAP } from '@/api/backend/configs.data';
import { GetAuctionItems } from '@/api/backend/items/GetAuctionItems';
import { PAGE, PaginationSchema, ROWS_PER_PAGE, type PaginationSearchParams } from '@/static';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import * as R from 'remeda';
import { z } from 'zod';

import { config } from '@/config';
import RedirectAuthError from '@/components/RedirectAuthError';
import WithoutPermissionsError from '@/components/WithoutPermissionsError/WithoutPermissionsError';

import { AuctionItemTable } from './AuctionItemTable';
import AutoRefreshPage from './AutoRefreshPage';
import { ConsignorFilter } from './ConsignorFilter';
import RemoveSearchBtn from './RemoveSearchBtn';
import { StatusFilter } from './StatusFilter';

export const metadata = { title: `物品列表 | ${config.site.name}` } satisfies Metadata;

const filterSchema = z.object({
  consignor: z.coerce.number().optional().catch(undefined),
  status: z
    .preprocess(
      (v) => (typeof v === 'string' ? [v] : v),
      z.coerce
        .number()
        .refine((v) => R.isIncludedIn(v, Object.values(AUCTION_ITEM_STATUS_MAP)))
        .array()
    )
    .default([]),
});

interface PageProps {
  searchParams: { consignor?: string; status?: string | string[] } & PaginationSearchParams;
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
  const pagination = PaginationSchema.parse(searchParams);
  const filters = filterSchema.parse(searchParams);

  const auctionItemsRes = await GetAuctionItems({
    consignorID: filters.consignor,
    status: filters.status,
    limit: pagination[ROWS_PER_PAGE],
    offset: pagination[PAGE] * pagination[ROWS_PER_PAGE],
  });

  if (auctionItemsRes.error === '1001') {
    return <WithoutPermissionsError permissions={['GetAuctionItems']} />;
  }

  if (auctionItemsRes.error === '1003') {
    return <RedirectAuthError />;
  }

  return (
    <AutoRefreshPage ms={10_000}>
      <Stack spacing={3}>
        <Stack direction="row" flexWrap="wrap" gap={2}>
          {/* <ConsignorFilter /> */}
          <StatusFilter selected={filters.status} />
          <RemoveSearchBtn fields={['consignor', 'status']} />
        </Stack>

        <AuctionItemTable rows={auctionItemsRes.data.auctionItems} count={auctionItemsRes.data.count} />
      </Stack>
    </AutoRefreshPage>
  );
}
