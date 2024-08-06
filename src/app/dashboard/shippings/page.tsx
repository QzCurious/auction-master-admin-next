import type { Metadata } from 'next';
import { SHIPPING_STATUS_MAP } from '@/api/backend/configs.data';
import { GetShippings } from '@/api/backend/shippings/GetShippings';
import { PAGE, PaginationSchema, ROWS_PER_PAGE, type PaginationSearchParams } from '@/static';
import { Box } from '@mui/material';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import * as R from 'remeda';
import { z } from 'zod';

import { config } from '@/config';
import RedirectAuthError from '@/components/RedirectAuthError';
import WithoutPermissionsError from '@/components/WithoutPermissionsError/WithoutPermissionsError';

import RemoveSearchBtn from './RemoveSearchBtn';
import { ShippingsTable } from './ShippingsTable';
import { StatusFilter } from './StatusFilter';

export const metadata = { title: `出貨列表 | ${config.site.name}` } satisfies Metadata;

const filterSchema = z.object({
  status: z
    .preprocess(
      (v) => (typeof v === 'string' ? [v] : v),
      z.coerce
        .number()
        .refine((v) => R.isIncludedIn(v, Object.values(SHIPPING_STATUS_MAP)))
        .array()
    )
    .default([]),
});

interface PageProps {
  searchParams: {
    consignor?: string;
    status?: string | string[];

    'pick-for-shipping': 'picking' | 'checking';
  } & PaginationSearchParams;
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
  const pagination = PaginationSchema.parse(searchParams);
  const filters = filterSchema.parse(searchParams);

  const [ShippingsRes] = await Promise.all([
    GetShippings({
      status: filters.status.length
        ? filters.status
        : [SHIPPING_STATUS_MAP.SubmitAppraisalStatus, SHIPPING_STATUS_MAP.ProcessingStatus],
      limit: pagination[ROWS_PER_PAGE],
      offset: pagination[PAGE] * pagination[ROWS_PER_PAGE],
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
        {!searchParams['pick-for-shipping'] && (
          <>
            <StatusFilter selected={filters.status} />
            <RemoveSearchBtn fields={['status']} />
          </>
        )}

        <Box mx="auto" />
      </Stack>

      <ShippingsTable rows={ShippingsRes.data.shippings} count={ShippingsRes.data.count} />
    </Stack>
  );
}
