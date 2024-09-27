import { type Metadata } from 'next';
import RouterLink from 'next/link';
import { notFound } from 'next/navigation';
import { GetAdmin } from '@/api/backend/admins/GetAdmin';
import { GetRoles } from '@/api/backend/rbac/GetRoles';
import RedirectAuthError from '@/domain/auth/RedirectAuthError';
import { havePermissions, PermissionsGuard } from '@/domain/permission/havePermissions.server';
import WithoutPermissionsError from '@/domain/permission/WithoutPermissionsError/WithoutPermissionsError';
import { SITE_NAME } from '@/domain/static/static';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import { Link } from '@mui/material';
import Typography from '@mui/material/Typography/Typography';
import { Box, Stack } from '@mui/system';

import EditAdminForm from './EditAdminForm';

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

      <PermissionsGuard permissions={['GetAdmin']}>
        <Content {...pageProps} />
      </PermissionsGuard>
    </>
  );
}

export default Page;

async function Content({ params }: PageProps) {
  const [adminRes, rolesRes] = await Promise.all([
    GetAdmin(parseInt(params.id)),
    (await havePermissions(['GetRoles'])) ? GetRoles() : undefined,
  ]);

  if (adminRes.error === '1001') {
    return <WithoutPermissionsError permissions={['GetAdmin']} />;
  }

  if (adminRes.error === '1003') {
    return <RedirectAuthError />;
  }

  if (!adminRes.data) {
    notFound();
  }

  return (
    <Box mt={4}>
      <EditAdminForm admin={adminRes.data} roles={rolesRes?.data ?? undefined} />
    </Box>
  );
}
