import type { Metadata } from 'next';
import { AdminGetConsignorVerifications } from '@/api/backend/consignor/AdminGetConsignorVerifications';
import RedirectAuthError from '@/domain/auth/RedirectAuthError';
import { parseSearchParams } from '@/domain/crud/parseSearchParams';
import { PermissionsGuard } from '@/domain/permission/havePermissions.server';
import WithoutPermissionsError from '@/domain/permission/WithoutPermissionsError/WithoutPermissionsError';
import { PAGE, ROWS_PER_PAGE, SITE_NAME } from '@/domain/static/static';
import { CONSIGNOR_VERIFICATION_STATUS } from '@/domain/static/static-config-mappers';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';

import { ConsignorVerificationTable } from './ConsignorVerificationTable';
import { SearchParamsSchema } from './SearchParamsSchema';

export const metadata = { title: `身份驗證列表 | ${SITE_NAME}` } satisfies Metadata;

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

      <PermissionsGuard permissions={['AdminGetConsignorVerifications']}>
        <section>
          <Table {...pageProps} />
        </section>
      </PermissionsGuard>
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
