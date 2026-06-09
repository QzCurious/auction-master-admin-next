import { type Metadata } from 'next';
import RouterLink from 'next/link';
import { GetPermissions } from '@/api/backend/rbac/GetPermissions';
import { GetRolePermissions } from '@/api/backend/rbac/GetRolePermissions';
import { HandleApiError } from '@/domain/api/HandleApiError';
import { PermissionsGuard } from '@/domain/permission/havePermissions.server';
import { SITE_NAME } from '@/domain/static/static';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import { Link } from '@mui/material';
import Typography from '@mui/material/Typography/Typography';
import { Box, Stack } from '@mui/system';

import EditRoleForm from './EditRoleForm';

export const metadata = { title: `編輯角色 | ${SITE_NAME}` } satisfies Metadata;

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

      <PermissionsGuard permissions={['GetPermissions', 'GetRolePermissions']}>
        <Content {...pageProps} />
      </PermissionsGuard>
    </>
  );
}

export default Page;

async function Content({ params }: PageProps) {
  const [permissionsRes, rolesPermissionsRes] = await Promise.all([GetPermissions(), GetRolePermissions(params.role)]);

  if (permissionsRes.error) {
    return <HandleApiError error={permissionsRes.error} />;
  }
  if (rolesPermissionsRes.error) {
    return <HandleApiError error={rolesPermissionsRes.error} />;
  }

  return (
    <Box mt={4}>
      <EditRoleForm
        permissionGroups={permissionsRes.data}
        role={decodeURI(params.role)}
        rolePermissions={rolesPermissionsRes.data}
      />
    </Box>
  );
}
