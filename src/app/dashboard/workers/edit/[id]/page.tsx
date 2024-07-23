import { type Metadata } from 'next';
import RouterLink from 'next/link';
import { notFound } from 'next/navigation';
import { GetWorker } from '@/api/backend/workers/GetWorker';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import { Box, Link } from '@mui/material';
import Typography from '@mui/material/Typography/Typography';
import { Stack } from '@mui/system';

import { config } from '@/config';
import RedirectAuthError from '@/components/RedirectAuthError';
import WithoutPermissionsError from '@/components/WithoutPermissionsError/WithoutPermissionsError';

import { WorkerForm } from './WorkerForm';

export const metadata = { title: `編輯物品 | ${config.site.name}` } satisfies Metadata;

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
