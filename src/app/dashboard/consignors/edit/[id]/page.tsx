import { type Metadata } from 'next';
import RouterLink from 'next/link';
import { notFound } from 'next/navigation';
import { AdminGetConsignor } from '@/api/backend/consignor/AdminGetConsignor';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import { Link } from '@mui/material';
import Typography from '@mui/material/Typography/Typography';
import { Stack } from '@mui/system';

import { config } from '@/config';
import RedirectAuthError from '@/components/RedirectAuthError';
import WithoutPermissionsError from '@/components/WithoutPermissionsError/WithoutPermissionsError';

import ConsignorForm from '../../ConsignorForm';

export const metadata = { title: `編輯管寄售人 | ${config.site.name}` } satisfies Metadata;

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

      <Form {...pageProps} />
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

  return <ConsignorForm consignor={consignorRes.data} />;
}
