import { type Metadata } from 'next';
import RouterLink from 'next/link';
import { GetPermissions } from '@/api/backend/rbac/GetPermissions';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import { Link } from '@mui/material';
import Typography from '@mui/material/Typography/Typography';
import { Stack } from '@mui/system';

import { config } from '@/config';
import RedirectAuthError from '@/components/RedirectAuthError';

import RoleForm from '../RoleForm';

export const metadata = { title: `新增角色 | ${config.site.name}` } satisfies Metadata;

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

      <Form />
    </>
  );
}

export default Page;

async function Form() {
  const [permissionsRes] = await Promise.all([GetPermissions()]);
  if (permissionsRes.error === '1003') {
    return <RedirectAuthError />;
  }

  if (permissionsRes.data || permissionsRes.error === '1001') {
    return <RoleForm permissions={permissionsRes.data} />;
  }

  throw new Error('Bug');
}
