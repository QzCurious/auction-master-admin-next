import { type Metadata } from 'next';
import RouterLink from 'next/link';
import { notFound } from 'next/navigation';
import { AdminGetConsignor } from '@/api/backend/consignor/AdminGetConsignor';
import { AdminGetConsignors } from '@/api/backend/consignor/AdminGetConsignors';
import { GetItemAndDetails } from '@/api/backend/items/GetItemAndDetails';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import { Box, Link } from '@mui/material';
import Typography from '@mui/material/Typography/Typography';
import { Stack } from '@mui/system';

import { config } from '@/config';
import RedirectAuthError from '@/components/RedirectAuthError';
import WithoutPermissionsError from '@/components/WithoutPermissionsError/WithoutPermissionsError';

import { ItemForm, ItemFormProvider } from './AuctionItemForm';
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
        新增物品
      </Typography>

      <Content {...pageProps} />
    </>
  );
}

export default Page;

async function Content({ params }: PageProps) {
  // 測有沒有權限
  const consignorRes = await AdminGetConsignors({ limit: 1, offset: 0 });

  if (consignorRes.error === '1001') {
    return <WithoutPermissionsError permissions={['AdminGetConsignor']} />;
  }

  if (consignorRes.error === '1003') {
    return <RedirectAuthError />;
  }

  return (
    <>
      <Box mt={2}>
        <PhotoListSection photos={[]} />
      </Box>

      <Box mt={4}>
        <ItemFormProvider >
          <Stack direction={{ xs: 'column', md: 'row' }} spacing={3}>
            <ItemForm />
          </Stack>
        </ItemFormProvider>
      </Box>
    </>
  );
}
