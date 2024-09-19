import { type Metadata } from 'next';
import RouterLink from 'next/link';
import { GetPermissions } from '@/api/backend/rbac/GetPermissions';
import { GetRolePermissions } from '@/api/backend/rbac/GetRolePermissions';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import { Link } from '@mui/material';
import Typography from '@mui/material/Typography/Typography';
import { Stack } from '@mui/system';

import { config } from '@/config';
import RedirectAuthError from '@/components/RedirectAuthError';
import WithoutPermissionsError from '@/components/WithoutPermissionsError/WithoutPermissionsError';

import RoleForm from '../../RoleForm';

export const metadata = { title: `編輯角色 | ${config.site.name}` } satisfies Metadata;

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
  const [permissionsRes, rolesPermissionsRes] = await Promise.all([GetPermissions(), GetRolePermissions(params.role)]);
  if (permissionsRes.error === '1001' || rolesPermissionsRes.error === '1001') {
    return <WithoutPermissionsError permissions={['GetPermissions', 'GetRolePermissions']} />;
  }

  if (permissionsRes.error === '1003' || rolesPermissionsRes.error === '1003') {
    return <RedirectAuthError />;
  }

  return (
    <RoleForm
      permissionGroups={permissionsRes.data}
      role={decodeURI(params.role)}
      rolePermissions={rolesPermissionsRes.data}
    />
  );
}
