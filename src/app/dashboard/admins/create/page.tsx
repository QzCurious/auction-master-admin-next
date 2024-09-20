import { type Metadata } from 'next';
import RouterLink from 'next/link';
import { GetRoles } from '@/api/backend/rbac/GetRoles';
import { SITE_NAME } from '@/domain/static/static';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import { Link } from '@mui/material';
import Typography from '@mui/material/Typography/Typography';
import { Stack } from '@mui/system';

import RedirectAuthError from '@/domain/auth/RedirectAuthError';
import WithoutPermissionsError from '@/domain/permission/WithoutPermissionsError/WithoutPermissionsError';

import AdminForm from '../AdminForm';

export const metadata = { title: `新增管理員 | ${SITE_NAME}` } satisfies Metadata;

async function Page() {
  return (
    <>
      <Link component={RouterLink} href="/dashboard/admins">
        <Stack direction="row" alignItems="center" columnGap={1}>
          <ArrowBackIcon /> 回到管理員列表
        </Stack>
      </Link>
      <Typography variant="h4" sx={{ mt: 3 }}>
        新增管理員
      </Typography>

      <Form />
    </>
  );
}

export default Page;

async function Form() {
  const [rolesRes] = await Promise.all([GetRoles()]);

  if (rolesRes.error === '1001') {
    return <WithoutPermissionsError permissions={['GetRoles']} />;
  }

  if (rolesRes.error === '1003') {
    return <RedirectAuthError />;
  }

  return <AdminForm roles={rolesRes.data} />;
}
