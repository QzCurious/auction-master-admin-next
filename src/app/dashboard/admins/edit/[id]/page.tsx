import { getAdmin } from '@/api/backend/admins/getAdmin';
import { configs } from '@/api/backend/configs';
import { roles } from '@/api/backend/rbac/roles';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import { Link } from '@mui/material';
import Typography from '@mui/material/Typography/Typography';
import { Stack } from '@mui/system';
import { type Metadata } from 'next';
import RouterLink from 'next/link';
import { notFound } from 'next/navigation';

import RedirectAuthError from '@/components/RedirectAuthError';
import WithoutPermissionsError from '@/components/WithoutPermissionsError/WithoutPermissionsError';
import { config } from '@/config';

import AdminForm from '../../AdminForm';

export const metadata = { title: `Edit admin | Dashboard | ${config.site.name}` } satisfies Metadata;

interface PageProps {
  params: { id: string };
}

async function Page(pageProps: PageProps) {
  return (
    <>
      <Link component={RouterLink} href="/dashboard/admins">
        <Stack direction="row" alignItems="center" columnGap={1}>
          <ArrowBackIcon /> Admins
        </Stack>
      </Link>
      <Typography variant="h4" sx={{ mt: 3 }}>
        Edit Admin
      </Typography>

      <Form {...pageProps} />
    </>
  );
}

export default Page;

async function Form({ params }: PageProps) {
  const [adminRes, configsRes, rolesRes] = await Promise.all([getAdmin(parseInt(params.id)), configs(), roles()]);

  if (adminRes.error === '1001' || configsRes.error === '1001' || rolesRes.error === '1001') {
    return <WithoutPermissionsError permissions={['GetAdmins', 'GetBackendConfigs', 'GetRoles']} />;
  }

  if (adminRes.error === '1003' || configsRes.error === '1003' || rolesRes.error === '1003') {
    return <RedirectAuthError />;
  }

  if (!adminRes.data) {
    notFound();
  }

  return <AdminForm admin={adminRes.data} adminStatus={configsRes.data.adminStatus} roles={rolesRes.data} />;
}
