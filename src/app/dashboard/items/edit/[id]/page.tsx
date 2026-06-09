import { type Metadata } from 'next';
import RouterLink from 'next/link';
import { notFound } from 'next/navigation';
import { AdminGetConsignor } from '@/api/backend/consignor/AdminGetConsignor';
import { GetItemAndDetails } from '@/api/backend/items/GetItemAndDetails';
import { HandleApiError } from '@/domain/api/HandleApiError';
import { havePermissions, PermissionsGuard } from '@/domain/permission/havePermissions.server';
import { SITE_NAME } from '@/domain/static/static';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import { Box, Link } from '@mui/material';
import Typography from '@mui/material/Typography/Typography';
import { Stack } from '@mui/system';

import { EditItemForm, ItemFormProvider } from './EditItemForm';
import PhotoListSection from './PhotoListSection';
import StatusFlowSection from './StatusFlowSection';

export const metadata = { title: `編輯物品 | ${SITE_NAME}` } satisfies Metadata;

interface PageProps {
  params: { id: string };
}

async function Page(pageProps: PageProps) {
  return (
    <>
      <Stack alignItems="start">
        <Link component={RouterLink} href="/dashboard/items">
          <Stack direction="row" alignItems="center" columnGap={1}>
            <ArrowBackIcon /> 回到物品列表
          </Stack>
        </Link>
      </Stack>
      <Typography variant="h4" sx={{ mt: 3 }}>
        編輯物品
      </Typography>

      <PermissionsGuard permissions={['GetItemAndDetails']}>
        <Content {...pageProps} />
      </PermissionsGuard>
    </>
  );
}

export default Page;

async function Content({ params }: PageProps) {
  const itemRes = await GetItemAndDetails(parseInt(params.id));

  if (itemRes.error) {
    return <HandleApiError error={itemRes.error} />;
  }

  if (!itemRes.data) {
    notFound();
  }

  const consignorRes = (await havePermissions(['AdminGetConsignor']))
    ? await AdminGetConsignor(itemRes.data.consignorId)
    : undefined;

  return (
    <>
      <Box mt={2}>
        <PhotoListSection item={itemRes.data} />
      </Box>

      <Box mt={4}>
        <ItemFormProvider item={itemRes.data}>
          <Stack direction={{ xs: 'column', md: 'row' }} spacing={3}>
            <EditItemForm item={itemRes.data} consignor={consignorRes?.data ?? undefined} />
            <StatusFlowSection item={itemRes.data} />
          </Stack>
        </ItemFormProvider>
      </Box>
    </>
  );
}
