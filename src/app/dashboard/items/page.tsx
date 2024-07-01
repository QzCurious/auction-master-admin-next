import type { Metadata } from 'next';
import { ITEM_STATUS_MAP, type ITEM_STATUS_DATA } from '@/api/backend/configs.data';
import { items } from '@/api/backend/items/items';
import { PAGE, PaginationSchema, ROWS_PER_PAGE, type PaginationSearchParams } from '@/static';
import { Stack } from '@mui/material';
import Typography from '@mui/material/Typography';
import * as R from 'remeda';
import { z } from 'zod';

import { config } from '@/config';
import RedirectAuthError from '@/components/RedirectAuthError';
import WithoutPermissionsError from '@/components/WithoutPermissionsError/WithoutPermissionsError';

import { ConsignorFilter } from './ConsignorFilter';
import RemoveSearchBtn from './RemoveSearchBtn';
import { ItemTable } from './ItemTable';
import { StatusFilter } from './StatusFilter';

export const metadata = { title: `物品列表 | ${config.site.name}` } satisfies Metadata;

const STATUS = 'SubmitAppraisalStatus' satisfies (typeof ITEM_STATUS_DATA)[number]['key'];

const filterSchema = z.object({
  consignor: z.number().optional().catch(undefined),
  status: z
    .preprocess(
      (v) => (typeof v === 'string' ? [v] : v),
      z.coerce
        .number()
        .refine((v) => R.isIncludedIn(v, Object.values(ITEM_STATUS_MAP)))
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
        <Stack spacing={1} sx={{ flex: '1 1 auto' }}>
          <Typography variant="h4">物品列表</Typography>
        </Stack>
      </Stack>

      <Table {...pageProps} />
    </Stack>
  );
}

async function Table({ searchParams }: PageProps) {
  const pagination = PaginationSchema.parse(searchParams);
  const filters = filterSchema.parse(searchParams);

  const itemsRes = await items({
    status: filters.status,
    limit: pagination[ROWS_PER_PAGE],
    offset: pagination[PAGE] * pagination[ROWS_PER_PAGE],
    consignorID: filters.consignor,
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
    <>
      <Stack direction="row" columnGap={2}>
        <ConsignorFilter />
        <StatusFilter status={filters.status} />
        <RemoveSearchBtn fields={['consignor', 'status']} />
      </Stack>

      <ItemTable rows={itemsRes.data.items} count={itemsRes.data.count} />
    </>
  );
}
