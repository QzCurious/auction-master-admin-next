import type { Metadata } from 'next';
import { GetWorkers } from '@/api/backend/workers/GetWorkers';
import { PAGE, parseSearchParams, ROWS_PER_PAGE } from '@/static';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';

import { config } from '@/config';
import { HavePermissionsOnly } from '@/contexts/UserContext';
import RedirectAuthError from '@/components/RedirectAuthError';
import RemoveSearchBtn from '@/components/RemoveSearchBtn';
import WithoutPermissionsError from '@/components/WithoutPermissionsError/WithoutPermissionsError';

import CreateDialog from './CreateDialog';
import { SearchParamsSchema } from './SearchParamsSchema';
import { StatusFilter } from './StatusFilter';
import { TypeFilter } from './TypeFilter';
import { WorkerTable } from './WorkerTable';

export const metadata = { title: `Worker 列表 | ${config.site.name}` } satisfies Metadata;

interface PageProps {
  searchParams: Record<string, string | string[] | undefined>;
}

export default async function Page(pageProps: PageProps) {
  return (
    <Stack spacing={3}>
      <Stack direction="row" spacing={3}>
        <Stack spacing={2} direction="row" justifyContent="space-between" sx={{ flex: '1 1 auto' }}>
          <Typography variant="h4" sx={{ flexShrink: 0 }}>
            Worker 列表
          </Typography>

          <HavePermissionsOnly permissionKeys={['CreateWorker']}>
            <CreateDialog />
          </HavePermissionsOnly>
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

  const workersRes = await GetWorkers({
    type: filters.type,
    status: filters.status,
    limit: filters[ROWS_PER_PAGE],
    offset: filters[PAGE] * filters[ROWS_PER_PAGE],
  });

  if (workersRes.error === '1001') {
    return <WithoutPermissionsError permissions={['GetWorkers']} />;
  }

  if (workersRes.error === '1003') {
    return <RedirectAuthError />;
  }

  return (
    <Stack spacing={3}>
      <Stack direction="row" flexWrap="wrap" gap={2}>
        <TypeFilter selected={filters.type} />
        <StatusFilter selected={filters.status} />
        <RemoveSearchBtn<keyof typeof filters> fields={['type', 'status']} />
      </Stack>

      <WorkerTable rows={workersRes.data.workers} count={workersRes.data.count} />
    </Stack>
  );
}
