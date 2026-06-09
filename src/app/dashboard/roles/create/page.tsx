import { type Metadata } from 'next';
import RouterLink from 'next/link';
import { GetPermissions } from '@/api/backend/rbac/GetPermissions';
import { havePermissions, PermissionsGuard } from '@/domain/permission/havePermissions.server';
import { SITE_NAME } from '@/domain/static/static';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import { Link } from '@mui/material';
import Typography from '@mui/material/Typography/Typography';
import { Box, Stack } from '@mui/system';

import CreateRoleForm from './CreateRoleForm';

export const metadata = { title: `新增角色 | ${SITE_NAME}` } satisfies Metadata;

async function Page() {
  return (
    <>
      <Link component={RouterLink} href="/dashboard/roles">
        <Stack direction="row" alignItems="center" columnGap={1}>
          <ArrowBackIcon /> 回到角色列表
        </Stack>
      </Link>
      <Typography variant="h4" sx={{ mt: 3 }}>
        新增角色
      </Typography>

      <PermissionsGuard permissions={['CreateRole']}>
        <Content />
      </PermissionsGuard>
    </>
  );
}

export default Page;

async function Content() {
  const [permissionsRes] = await Promise.all([
    (await havePermissions(['GetPermissions'])) ? GetPermissions() : undefined,
  ]);

  return (
    <Box mt={4}>
      <CreateRoleForm permissionGroups={permissionsRes?.data ?? undefined} />
    </Box>
  );
}
