import type { Metadata } from 'next';
import { AdminGetConsignors } from '@/api/backend/consignor/AdminGetConsignors';
import { PAGE, parseSearchParams, ROWS_PER_PAGE } from '@/static';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';

import { config } from '@/config';
import RedirectAuthError from '@/components/RedirectAuthError';
import WithoutPermissionsError from '@/components/WithoutPermissionsError/WithoutPermissionsError';

import { ConsignorTable } from './ConsignorTable';
import { SearchParamsSchema } from './SearchParamsSchema';

export const metadata = { title: `寄售人列表 | ${config.site.name}` } satisfies Metadata;

interface PageProps {
  searchParams: Record<string, string | string[] | undefined>;
}

export default async function Page(pageProps: PageProps) {
  return (
    <Stack spacing={3}>
      <Stack direction="row" spacing={3}>
        <Stack spacing={1} sx={{ flex: '1 1 auto' }}>
          <Typography variant="h4">寄售人列表</Typography>
        </Stack>
      </Stack>

      <section>
        <Table {...pageProps} />
      </section>
    </Stack>
  );
}

async function Table({ searchParams }: PageProps) {
  const filters = parseSearchParams(SearchParamsSchema, searchParams);
  const [consignorsRes] = await Promise.all([
    AdminGetConsignors({
      sort: 'createdAt',
      order: 'desc',
      limit: filters[ROWS_PER_PAGE],
      offset: filters[PAGE] * filters[ROWS_PER_PAGE],
    }),
  ]);

  if (consignorsRes.error === '1001') {
    return <WithoutPermissionsError permissions={['AdminGetConsignors']} />;
  }

  if (consignorsRes.error === '1003') {
    return <RedirectAuthError />;
  }

  return <ConsignorTable rows={consignorsRes.data.consignors} count={consignorsRes.data.count} />;
}
