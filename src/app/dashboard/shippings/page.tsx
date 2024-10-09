import type { Metadata } from 'next';
import { GetShippings } from '@/api/backend/shippings/GetShippings';
import { GetConfigs } from '@/api/GetConfigs';
import RedirectAuthError from '@/domain/auth/RedirectAuthError';
import { AuctionIdFilter } from '@/domain/crud/AuctionIdFilter';
import { parseSearchParams } from '@/domain/crud/parseSearchParams';
import { RangeFilter } from '@/domain/crud/RangeFilter';
import RemoveSearchBtn from '@/domain/crud/RemoveSearchBtn';
import { PermissionsGuard } from '@/domain/permission/havePermissions.server';
import WithoutPermissionsError from '@/domain/permission/WithoutPermissionsError/WithoutPermissionsError';
import { PAGE, ROWS_PER_PAGE, SITE_NAME } from '@/domain/static/static';
import { SHIPPING_STATUS } from '@/domain/static/static-config-mappers';
import { Box } from '@mui/material';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';

import ExportExcelButton from './ExportExcelButton';
import { fixRange, MAX_MONTHS, SearchParamsSchema } from './SearchParamsSchema';
import { ShippingsTable } from './ShippingsTable';
import { StatusFilter } from './StatusFilter';

export const metadata = { title: `出貨列表 | ${SITE_NAME}` } satisfies Metadata;

interface PageProps {
  searchParams: Record<string, string | string[] | undefined>;
}

export default async function Page(pageProps: PageProps) {
  return (
    <Stack spacing={3}>
      <Stack direction="row" spacing={3}>
        <Stack spacing={2} direction="row" justifyContent="space-between" sx={{ flex: '1 1 auto' }}>
          <Typography variant="h4" sx={{ flexShrink: 0 }}>
            出貨列表
          </Typography>
        </Stack>
      </Stack>

      <PermissionsGuard permissions={['GetShippings']}>
        <section>
          <Content {...pageProps} />
        </section>
      </PermissionsGuard>
    </Stack>
  );
}

async function Content({ searchParams }: PageProps) {
  const query = parseSearchParams(SearchParamsSchema, searchParams);
  const { startAt, endAt } = fixRange(query.startAt, query.endAt);
  const q = {
    auctionId: query.auctionId,
    status: query.status.length
      ? query.status
      : [
          SHIPPING_STATUS.enum('SubmitAppraisalStatus'),
          SHIPPING_STATUS.enum('ProcessingStatus'),
          SHIPPING_STATUS.enum('ShippedStatus'),
        ],
    endAt,
    startAt,
    sort: 'createdAt',
    order: 'desc',
    limit: query[ROWS_PER_PAGE],
    offset: query[PAGE] * query[ROWS_PER_PAGE],
  } as const;

  const [shippingsRes, configsRes] = await Promise.all([GetShippings(q), GetConfigs()]);

  if (shippingsRes.error === '1001' || configsRes.error === '1001') {
    return <WithoutPermissionsError permissions={['GetShippings']} />;
  }

  if (shippingsRes.error === '1003' || configsRes.error === '1003') {
    return <RedirectAuthError />;
  }

  return (
    <Stack spacing={3}>
      <Stack direction="row" flexWrap="wrap" gap={2}>
        <RangeFilter startAt={query.startAt} endAt={query.endAt} within={{ months: MAX_MONTHS }} />
        <StatusFilter selected={query.status} />
        <AuctionIdFilter values={query.auctionId} />
        <RemoveSearchBtn<keyof typeof query> fields={['auctionId', 'startAt', 'endAt', 'status']} />

        <Box mx="auto" />

        <ExportExcelButton {...q} />
      </Stack>

      <ShippingsTable
        configs={configsRes.data}
        query={query}
        rows={shippingsRes.data.shippings}
        count={shippingsRes.data.count}
      />
    </Stack>
  );
}
