import { type Metadata } from 'next';
import RouterLink from 'next/link';
import { GetRoles } from '@/api/backend/rbac/GetRoles';
import { havePermissions } from '@/domain/permission/havePermissions.server';
import { SITE_NAME } from '@/domain/static/static';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import { Link } from '@mui/material';
import Typography from '@mui/material/Typography/Typography';
import { Stack } from '@mui/system';

import CreateAdminForm from './CreateAdminForm';

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
  const [rolesRes] = await Promise.all([(await havePermissions(['GetRoles'])) ? GetRoles() : undefined]);

  return <CreateAdminForm roles={rolesRes?.data ?? undefined} />;
}
