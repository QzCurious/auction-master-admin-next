import type { Metadata } from 'next';
import { AdminGetConsignorVerifications } from '@/api/backend/consignor/AdminGetConsignorVerifications';
import { CONSIGNOR_VERIFICATION_STATUS } from '@/api/backend/static-configs.data';
import { PAGE, parseSearchParams, ROWS_PER_PAGE } from '@/static';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';

import { config } from '@/config';
import RedirectAuthError from '@/components/RedirectAuthError';
import WithoutPermissionsError from '@/components/WithoutPermissionsError/WithoutPermissionsError';

import { ConsignorVerificationTable } from './ConsignorVerificationTable';
import { SearchParamsSchema } from './SearchParamsSchema';

export const metadata = { title: `身份驗證列表 | ${config.site.name}` } satisfies Metadata;

interface PageProps {
  searchParams: Record<string, string | string[] | undefined>;
}

export default async function Page(pageProps: PageProps) {
  return (
    <Stack spacing={3}>
      <Stack direction="row" spacing={3}>
        <Stack spacing={1} sx={{ flex: '1 1 auto' }}>
          <Typography variant="h4">身份驗證列表</Typography>
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
  const [consignorVerificationsRes] = await Promise.all([
    AdminGetConsignorVerifications({
      status: CONSIGNOR_VERIFICATION_STATUS.enum('AwaitingVerificationCompletionStatus'),
      sort: 'createdAt',
      order: 'desc',
      limit: filters[ROWS_PER_PAGE],
      offset: filters[PAGE] * filters[ROWS_PER_PAGE],
    }),
  ]);

  if (consignorVerificationsRes.error === '1001') {
    return <WithoutPermissionsError permissions={['AdminGetConsignorVerifications']} />;
  }

  if (consignorVerificationsRes.error === '1003') {
    return <RedirectAuthError />;
  }

  return (
    <ConsignorVerificationTable
      rows={consignorVerificationsRes.data.consignorVerifications}
      count={consignorVerificationsRes.data.count}
    />
  );
}
