import type { Metadata } from 'next';
import { configs } from '@/api/backend/configs';
import { items } from '@/api/backend/items/items';
import { PAGE, PaginationSchema, ROWS_PER_PAGE, type PaginationSearchParams } from '@/static';
import { Stack } from '@mui/material';
import Typography from '@mui/material/Typography';

import { config } from '@/config';
import RedirectAuthError from '@/components/RedirectAuthError';
import WithoutPermissionsError from '@/components/WithoutPermissionsError/WithoutPermissionsError';

import { ItemTable } from './ItemTable';
import StatusTabs from './StatusTabs';

export const metadata = { title: `物品列表 | Dashboard | ${config.site.name}` } satisfies Metadata;

const STATUS = 'SubmitAppraisalStatus';

interface PageProps {
  searchParams: { consignor?: string } & PaginationSearchParams;
}

export default async function Page(pageProps: PageProps) {
  return (
    <Stack spacing={3}>
      <Stack direction="row" spacing={3}>
        <Stack spacing={1} sx={{ flex: '1 1 auto' }}>
          <Typography variant="h4">物品列表</Typography>
        </Stack>
      </Stack>

      <StatusTabs status={STATUS} />
      <Table {...pageProps} />
    </Stack>
  );
}

async function Table({ searchParams }: PageProps) {
  const configsRes = await configs();
  if (configsRes.error === '1001') {
    return <WithoutPermissionsError permissions={['GetItemsAndDetails', 'GetBackendConfigs']} />;
  }
  if (configsRes.error === '1003') {
    return <RedirectAuthError />;
  }

  const status = configsRes.data.itemStatus.find((status) => status.key === STATUS)?.value;
  if (!status) {
    throw new Error('Backend bug');
  }
  const pagination = PaginationSchema.parse(searchParams);
  pagination[ROWS_PER_PAGE];
  pagination[PAGE];

  const itemsRes = await items({
    status,
    limit: pagination[ROWS_PER_PAGE],
    offset: pagination[PAGE] * pagination[ROWS_PER_PAGE],
    consignorID: searchParams.consignor ? Number(searchParams.consignor) : undefined,
  });

  if (itemsRes.error === '1001' || configsRes.error === '1001') {
    return <WithoutPermissionsError permissions={['GetItemsAndDetails', 'GetBackendConfigs']} />;
  }

  if (itemsRes.error === '1003' || configsRes.error === '1003') {
    return <RedirectAuthError />;
  }

  return <ItemTable rows={itemsRes.data.items} count={itemsRes.data.count} />;
}
