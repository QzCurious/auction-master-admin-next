import { type Metadata } from 'next';
import RouterLink from 'next/link';
import { notFound } from 'next/navigation';
import { permissions } from '@/api/backend/rbac/permissions';
import { rolesPermissions } from '@/api/backend/rbac/rolesPermissions';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import { Link } from '@mui/material';
import Typography from '@mui/material/Typography/Typography';
import { Stack } from '@mui/system';

import { config } from '@/config';
import RedirectAuthError from '@/components/RedirectAuthError';
import WithoutPermissionsError from '@/components/WithoutPermissionsError/WithoutPermissionsError';

import RoleForm from '../../RoleForm';

export const metadata = { title: `Create role | Dashboard | ${config.site.name}` } satisfies Metadata;

interface PageProps {
  params: { role: string };
}

async function Page(pageProps: PageProps) {
  return (
    <>
      <Link component={RouterLink} href="/dashboard/roles">
        <Stack direction="row" alignItems="center" columnGap={1}>
          <ArrowBackIcon /> 回到角色列表
        </Stack>
      </Link>
      <Typography variant="h4" sx={{ mt: 3 }}>
        編輯角色權限
      </Typography>

      <Form {...pageProps} />
    </>
  );
}

export default Page;

async function Form({ params }: PageProps) {
  const [permissionsRes, rolesPermissionsRes] = await Promise.all([permissions(), rolesPermissions()]);
  if (permissionsRes.error === '1001' || rolesPermissionsRes.error === '1001') {
    return <WithoutPermissionsError permissions={['GetPermissions', 'GetRolesPermission']} />;
  }

  if (permissionsRes.error === '1003' || rolesPermissionsRes.error === '1003') {
    return <RedirectAuthError />;
  }

  const role = rolesPermissionsRes.data.find((role) => params.role === role.role);

  if (!role) {
    notFound();
  }

  return <RoleForm permissions={permissionsRes.data} role={role} />;
}
