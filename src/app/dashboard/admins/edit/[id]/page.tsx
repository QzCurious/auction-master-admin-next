import { type Metadata } from 'next';
import RouterLink from 'next/link';
import { notFound } from 'next/navigation';
import { getAdmin } from '@/api/backend/admins/getAdmin';
import { roles } from '@/api/backend/rbac/roles';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import { Link } from '@mui/material';
import Typography from '@mui/material/Typography/Typography';
import { Stack } from '@mui/system';

import { config } from '@/config';
import RedirectAuthError from '@/components/RedirectAuthError';
import WithoutPermissionsError from '@/components/WithoutPermissionsError/WithoutPermissionsError';

import AdminForm from '../../AdminForm';

export const metadata = { title: `編輯管理員 | ${config.site.name}` } satisfies Metadata;


interface PageProps {
  params: { id: string };
}

async function Page(pageProps: PageProps) {
  return (
    <>
      <Link component={RouterLink} href="/dashboard/admins">
        <Stack direction="row" alignItems="center" columnGap={1}>
          <ArrowBackIcon /> 回到管理員列表
        </Stack>
      </Link>
      <Typography variant="h4" sx={{ mt: 3 }}>
        編輯管理員
      </Typography>

      <Form {...pageProps} />
    </>
  );
}

export default Page;

async function Form({ params }: PageProps) {
  const [adminRes, rolesRes] = await Promise.all([getAdmin(parseInt(params.id)), roles()]);

  if (adminRes.error === '1001' || rolesRes.error === '1001') {
    return <WithoutPermissionsError permissions={['GetAdmin', 'GetBackendConfigs', 'GetRoles']} />;
  }

  if (adminRes.error === '1003' || rolesRes.error === '1003') {
    return <RedirectAuthError />;
  }

  if (!adminRes.data) {
    notFound();
  }

  return <AdminForm admin={adminRes.data} roles={rolesRes.data} />;
}
