import type { Metadata } from 'next';
import { GetShippings } from '@/api/backend/shippings/GetShippings';
import { SHIPPING_STATUS } from '@/api/backend/static-configs.data';
import { PAGE, parseSearchParams, ROWS_PER_PAGE } from '@/static';
import { Box } from '@mui/material';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';

import { config } from '@/config';
import RedirectAuthError from '@/components/RedirectAuthError';
import RemoveSearchBtn from '@/components/RemoveSearchBtn';
import WithoutPermissionsError from '@/components/WithoutPermissionsError/WithoutPermissionsError';

import { SearchParamsSchema } from './SearchParamsSchema';
import { ShippingsTable } from './ShippingsTable';
import { StatusFilter } from './StatusFilter';

export const metadata = { title: `出貨列表 | ${config.site.name}` } satisfies Metadata;

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

      <section>
        <Content {...pageProps} />
      </section>
    </Stack>
  );
}

async function Content({ searchParams }: PageProps) {
  const filters = parseSearchParams(SearchParamsSchema, searchParams);

  const [ShippingsRes] = await Promise.all([
    GetShippings({
      status: filters.status.length
        ? filters.status
        : [SHIPPING_STATUS.enum('SubmitAppraisalStatus'), SHIPPING_STATUS.enum('ProcessingStatus')],
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
        {!filters['pick-for-shipping'] && (
          <>
            <StatusFilter selected={filters.status} />
            <RemoveSearchBtn<keyof typeof filters> fields={['status']} />
          </>
        )}

        <Box mx="auto" />
      </Stack>

      <ShippingsTable rows={ShippingsRes.data.shippings} count={ShippingsRes.data.count} />
    </Stack>
  );
}
