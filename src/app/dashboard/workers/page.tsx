import type { Metadata } from 'next';
import { GetWorkers } from '@/api/backend/workers/GetWorkers';
import { HandleApiError } from '@/domain/api/HandleApiError';
import { parseSearchParams } from '@/domain/crud/parseSearchParams';
import RemoveSearchBtn from '@/domain/crud/RemoveSearchBtn';
import { PermissionsGuard } from '@/domain/permission/havePermissions.server';
import { HavePermissionsOnly } from '@/domain/permission/HavePermissionsOnly';
import { PAGE, ROWS_PER_PAGE, SITE_NAME } from '@/domain/static/static';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';

import CreateDialog from './CreateDialog';
import { SearchParamsSchema } from './SearchParamsSchema';
import { StatusFilter } from './StatusFilter';
import { TypeFilter } from './TypeFilter';
import { WorkerTable } from './WorkerTable';

export const metadata = { title: `Worker 列表 | ${SITE_NAME}` } satisfies Metadata;

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

          <HavePermissionsOnly permissions={['CreateWorker']}>
            <CreateDialog />
          </HavePermissionsOnly>
        </Stack>
      </Stack>

      <PermissionsGuard permissions={['GetWorkers']}>
        <section>
          <Content {...pageProps} />
        </section>
      </PermissionsGuard>
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

  if (workersRes.error) {
    return <HandleApiError error={workersRes.error} />;
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
