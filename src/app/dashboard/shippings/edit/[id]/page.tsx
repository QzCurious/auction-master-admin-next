import { type Metadata } from 'next';
import RouterLink from 'next/link';
import { notFound } from 'next/navigation';
import { GetShipping } from '@/api/backend/shippings/GetShipping';
import RedirectAuthError from '@/domain/auth/RedirectAuthError';
import { PermissionsGuard } from '@/domain/permission/havePermissions.server';
import WithoutPermissionsError from '@/domain/permission/WithoutPermissionsError/WithoutPermissionsError';
import { SITE_NAME } from '@/domain/static/static';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import { Link } from '@mui/material';
import Typography from '@mui/material/Typography/Typography';
import { Box, Stack } from '@mui/system';

import { EditShippingForm, ItemFormProvider } from './EditShippingForm';

export const metadata = { title: `編輯出貨 | ${SITE_NAME}` } satisfies Metadata;

interface PageProps {
  params: { id: string };
}

async function Page(pageProps: PageProps) {
  return (
    <>
      <Stack alignItems="start">
        <Link component={RouterLink} href="/dashboard/shippings">
          <Stack direction="row" alignItems="center" columnGap={1}>
            <ArrowBackIcon /> 回到出貨列表
          </Stack>
        </Link>
      </Stack>
      <Typography variant="h4" sx={{ mt: 3 }}>
        編輯出貨
      </Typography>

      <PermissionsGuard permissions={['GetShipping']}>
        <Content {...pageProps} />
      </PermissionsGuard>
    </>
  );
}

export default Page;

async function Content({ params }: PageProps) {
  const shippingRes = await GetShipping(params.id);

  if (shippingRes.error === '1001') {
    return <WithoutPermissionsError permissions={['GetShipping']} />;
  }

  if (shippingRes.error === '1003') {
    return <RedirectAuthError />;
  }

  if (!shippingRes.data) {
    notFound();
  }

  return (
    <Box mt={4}>
      <ItemFormProvider shipping={shippingRes.data}>
        <EditShippingForm shipping={shippingRes.data} />
      </ItemFormProvider>
    </Box>
  );
}
