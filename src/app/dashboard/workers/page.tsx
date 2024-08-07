import type { Metadata } from 'next';
import { WORKER_STATUS, WORKER_TYPE } from '@/api/backend/configs.data';
import { GetWorkers } from '@/api/backend/workers/GetWorkers';
import { PAGE, PaginationSchema, ROWS_PER_PAGE, type PaginationSearchParams } from '@/static';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import * as R from 'remeda';
import { z } from 'zod';

import { config } from '@/config';
import { HavePermissionsOnly } from '@/contexts/UserContext';
import RedirectAuthError from '@/components/RedirectAuthError';
import WithoutPermissionsError from '@/components/WithoutPermissionsError/WithoutPermissionsError';

import CreateDialog from './CreateDialog';
import RemoveSearchBtn from './RemoveSearchBtn';
import { StatusFilter } from './StatusFilter';
import { TypeFilter } from './TypeFilter';
import { WorkerTable } from './WorkerTable';

export const metadata = { title: `Worker 列表 | ${config.site.name}` } satisfies Metadata;

const filterSchema = z.object({
  type: z
    .preprocess(
      (v) => (typeof v === 'string' ? [v] : v),
      z
        .string()
        .refine(R.isIncludedIn(WORKER_TYPE.data.map((item) => item.value)))
        .array()
    )
    .default([]),
  status: z
    .preprocess(
      (v) => (typeof v === 'string' ? [v] : v),
      z.coerce
        .number()
        .refine(R.isIncludedIn(WORKER_STATUS.data.map((item) => item.value)))
        .array()
    )
    .default([]),
});

interface PageProps {
  searchParams: { consignor?: string; status?: string | string[] } & PaginationSearchParams;
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
  const pagination = PaginationSchema.parse(searchParams);
  const filters = filterSchema.parse(searchParams);

  const workersRes = await GetWorkers({
    type: filters.type,
    status: filters.status,
    limit: pagination[ROWS_PER_PAGE],
    offset: pagination[PAGE] * pagination[ROWS_PER_PAGE],
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
        <RemoveSearchBtn fields={['type', 'status']} />
      </Stack>

      <WorkerTable rows={workersRes.data.workers} count={workersRes.data.count} />
    </Stack>
  );
}
