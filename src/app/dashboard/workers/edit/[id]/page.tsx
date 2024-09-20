import { type Metadata } from 'next';
import RouterLink from 'next/link';
import { notFound } from 'next/navigation';
import { GetWorker } from '@/api/backend/workers/GetWorker';
import { SITE_NAME } from '@/domain/static/static';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import { Box, Link } from '@mui/material';
import Typography from '@mui/material/Typography/Typography';
import { Stack } from '@mui/system';

import RedirectAuthError from '@/domain/auth/RedirectAuthError';
import WithoutPermissionsError from '@/domain/permission/WithoutPermissionsError/WithoutPermissionsError';

import { WorkerForm } from './WorkerForm';

export const metadata = { title: `編輯物品 | ${SITE_NAME}` } satisfies Metadata;

interface PageProps {
  params: { id: string };
}

async function Page(pageProps: PageProps) {
  return (
    <>
      <Stack alignItems="start">
        <Link component={RouterLink} href="/dashboard/workers">
          <Stack direction="row" alignItems="center" columnGap={1}>
            <ArrowBackIcon /> 回到 Worker 列表
          </Stack>
        </Link>
      </Stack>
      <Typography variant="h4" sx={{ mt: 3 }}>
        編輯 Worker
      </Typography>

      <Content {...pageProps} />
    </>
  );
}

export default Page;

async function Content({ params }: PageProps) {
  const workerRes = await GetWorker(parseInt(params.id));

  if (workerRes.error === '1001') {
    return <WithoutPermissionsError permissions={['GetItemAndDetails']} />;
  }

  if (workerRes.error === '1003') {
    return <RedirectAuthError />;
  }

  if (!workerRes.data) {
    notFound();
  }

  return (
    <Box mt={4}>
      <Stack direction={{ xs: 'column', md: 'row' }} spacing={3}>
        <WorkerForm worker={workerRes.data} />
      </Stack>
    </Box>
  );
}
