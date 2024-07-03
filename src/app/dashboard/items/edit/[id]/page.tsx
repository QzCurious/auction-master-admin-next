import { getConsignor } from '@/api/backend/consignor/getConsignor';
import { getItem } from '@/api/backend/items/getItem';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import { Box, Link } from '@mui/material';
import Typography from '@mui/material/Typography/Typography';
import { Stack } from '@mui/system';
import { type Metadata } from 'next';
import RouterLink from 'next/link';
import { notFound } from 'next/navigation';

import RedirectAuthError from '@/components/RedirectAuthError';
import WithoutPermissionsError from '@/components/WithoutPermissionsError/WithoutPermissionsError';
import { config } from '@/config';

import { ItemForm, ItemFormProvider } from './ItemForm';
import PhotoListSection from './PhotoListSection';
import StatusFlowSection from './StatusFlowSection';

export const metadata = { title: `編輯物品 | ${config.site.name}` } satisfies Metadata;

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

      <Content {...pageProps} />
    </>
  );
}

export default Page;

async function Content({ params }: PageProps) {
  const itemRes = await getItem(parseInt(params.id));

  if (itemRes.error === '1001') {
    return <WithoutPermissionsError permissions={['GetItemAndDetails']} />;
  }

  if (itemRes.error === '1003') {
    return <RedirectAuthError />;
  }

  if (!itemRes.data) {
    notFound();
  }

  const consignorRes = await getConsignor(itemRes.data.consignorID);

  if (consignorRes.error === '1001') {
    return <WithoutPermissionsError permissions={['AdminGetConsignor']} />;
  }

  if (consignorRes.error === '1003') {
    return <RedirectAuthError />;
  }

  return (
    <>
      <Box mt={2}>
        <PhotoListSection item={itemRes.data} />
      </Box>

      <Box mt={4}>
        <ItemFormProvider item={itemRes.data}>
          <Stack direction={{ xs: 'column', md: 'row' }} spacing={3}>
            <ItemForm item={itemRes.data} consignor={consignorRes.data} />
            <StatusFlowSection item={itemRes.data} />
          </Stack>
        </ItemFormProvider>
      </Box>
    </>
  );
}
