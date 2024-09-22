import { type Metadata } from 'next';
import RouterLink from 'next/link';
import { notFound } from 'next/navigation';
import { AdminGetConsignor } from '@/api/backend/consignor/AdminGetConsignor';
import RedirectAuthError from '@/domain/auth/RedirectAuthError';
import { PermissionsGuard } from '@/domain/permission/havePermissions.server';
import WithoutPermissionsError from '@/domain/permission/WithoutPermissionsError/WithoutPermissionsError';
import { SITE_NAME } from '@/domain/static/static';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import { Link } from '@mui/material';
import Typography from '@mui/material/Typography/Typography';
import { Stack } from '@mui/system';

import EditConsignorForm from './EditConsignorForm';

export const metadata = { title: `編輯管寄售人 | ${SITE_NAME}` } satisfies Metadata;

interface PageProps {
  params: { id: string };
}

async function Page(pageProps: PageProps) {
  return (
    <>
      <Link component={RouterLink} href="/dashboard/consignors">
        <Stack direction="row" alignItems="center" columnGap={1}>
          <ArrowBackIcon /> 回到寄售人列表
        </Stack>
      </Link>
      <Typography variant="h4" sx={{ mt: 3 }}>
        編輯寄售人
      </Typography>

      <PermissionsGuard permissions={['AdminGetConsignor']}>
        <Form {...pageProps} />
      </PermissionsGuard>
    </>
  );
}

export default Page;

async function Form({ params }: PageProps) {
  const [consignorRes] = await Promise.all([AdminGetConsignor(parseInt(params.id))]);

  if (consignorRes.error === '1001') {
    return <WithoutPermissionsError permissions={['AdminGetConsignor']} />;
  }

  if (consignorRes.error === '1003') {
    return <RedirectAuthError />;
  }

  if (!consignorRes.data) {
    notFound();
  }

  return <EditConsignorForm consignor={consignorRes.data} />;
}
