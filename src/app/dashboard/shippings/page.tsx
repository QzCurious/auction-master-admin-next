import type { Metadata } from 'next';
import { GetShippings } from '@/api/backend/shippings/GetShippings';
import RedirectAuthError from '@/domain/auth/RedirectAuthError';
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
  const filters = parseSearchParams(SearchParamsSchema, searchParams);
  const { startAt, endAt } = fixRange(filters.startAt, filters.endAt);

  const [ShippingsRes] = await Promise.all([
    GetShippings({
      status: filters.status.length
        ? filters.status
        : [SHIPPING_STATUS.enum('SubmitAppraisalStatus'), SHIPPING_STATUS.enum('ProcessingStatus')],
      endAt,
      startAt,
      sort: 'createdAt',
      order: 'desc',
      limit: filters[ROWS_PER_PAGE],
      offset: filters[PAGE] * filters[ROWS_PER_PAGE],
    }),
  ]);

  if (ShippingsRes.error === '1001') {
    return <WithoutPermissionsError permissions={['GetShippings']} />;
  }

  if (ShippingsRes.error === '1003') {
    return <RedirectAuthError />;
  }

  return (
    <Stack spacing={3}>
      <Stack direction="row" flexWrap="wrap" gap={2}>
        <RangeFilter startAt={filters.startAt} endAt={filters.endAt} within={{ months: MAX_MONTHS }} />
        <StatusFilter selected={filters.status} />
        <RemoveSearchBtn<keyof typeof filters> fields={['startAt', 'endAt', 'status']} />

        <Box mx="auto" />
      </Stack>

      <ShippingsTable rows={ShippingsRes.data.shippings} count={ShippingsRes.data.count} />
    </Stack>
  );
}
