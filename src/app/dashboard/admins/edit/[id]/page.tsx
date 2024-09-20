import { type Metadata } from 'next';
import RouterLink from 'next/link';
import { notFound } from 'next/navigation';
import { GetAdmin } from '@/api/backend/admins/GetAdmin';
import { GetRoles } from '@/api/backend/rbac/GetRoles';
import { SITE_NAME } from '@/domain/static/static';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import { Link } from '@mui/material';
import Typography from '@mui/material/Typography/Typography';
import { Stack } from '@mui/system';

import RedirectAuthError from '@/domain/auth/RedirectAuthError';
import WithoutPermissionsError from '@/domain/permission/WithoutPermissionsError/WithoutPermissionsError';

import AdminForm from '../../AdminForm';

export const metadata = { title: `編輯管理員 | ${SITE_NAME}` } satisfies Metadata;

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
  const [adminRes, rolesRes] = await Promise.all([GetAdmin(parseInt(params.id)), GetRoles()]);

  if (adminRes.error === '1001' || rolesRes.error === '1001') {
    return <WithoutPermissionsError permissions={['GetAdmin', 'GetRoles']} />;
  }

  if (adminRes.error === '1003' || rolesRes.error === '1003') {
    return <RedirectAuthError />;
  }

  if (!adminRes.data) {
    notFound();
  }

  return <AdminForm admin={adminRes.data} roles={rolesRes.data} />;
}
