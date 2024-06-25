import type { Metadata } from 'next';
import { CONSIGNOR_VERIFICATION_STATUS_MAP } from '@/api/backend/configs.data';
import { consignorVerifications } from '@/api/backend/consignor/consignorVerifications';
import { PAGE, PaginationSchema, ROWS_PER_PAGE, type PaginationSearchParams } from '@/static';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';

import { config } from '@/config';
import RedirectAuthError from '@/components/RedirectAuthError';
import WithoutPermissionsError from '@/components/WithoutPermissionsError/WithoutPermissionsError';

import { ConsignorVerificationTable } from './ConsignorVerificationTable';

export const metadata = { title: `身份驗證列表 | ${config.site.name}` } satisfies Metadata;

interface PageProps {
  searchParams: PaginationSearchParams;
}

export default async function Page(pageProps: PageProps) {
  return (
    <Stack spacing={3}>
      <Stack direction="row" spacing={3}>
        <Stack spacing={1} sx={{ flex: '1 1 auto' }}>
          <Typography variant="h4">身份驗證列表</Typography>
        </Stack>
      </Stack>

      <Table {...pageProps} />
    </Stack>
  );
}

async function Table({ searchParams }: PageProps) {
  const pagination = PaginationSchema.parse(searchParams);
  const [consignorVerificationsRes] = await Promise.all([
    consignorVerifications({
      status: CONSIGNOR_VERIFICATION_STATUS_MAP.AwaitingVerificationCompletionStatus,
      limit: pagination[ROWS_PER_PAGE],
      offset: pagination[PAGE] * pagination[ROWS_PER_PAGE],
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
