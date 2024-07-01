import { type Metadata } from 'next';
import RouterLink from 'next/link';
import { notFound } from 'next/navigation';
import { getConsignor } from '@/api/backend/consignor/getConsignor';
import { getItem } from '@/api/backend/items/getItem';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import { Link } from '@mui/material';
import Typography from '@mui/material/Typography/Typography';
import { Stack } from '@mui/system';

import { config } from '@/config';
import RedirectAuthError from '@/components/RedirectAuthError';
import WithoutPermissionsError from '@/components/WithoutPermissionsError/WithoutPermissionsError';

import ItemForm from './ItemForm';

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

      <Form {...pageProps} />
    </>
  );
}

export default Page;

async function Form({ params }: PageProps) {
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

  const consignor = await getConsignor(itemRes.data.consignorID);

  if (consignor.error === '1001') {
    return <WithoutPermissionsError permissions={['AdminGetConsignor']} />;
  }

  if (consignor.error === '1003') {
    return <RedirectAuthError />;
  }

  return <ItemForm item={itemRes.data} consignor={consignor.data} />;
}
