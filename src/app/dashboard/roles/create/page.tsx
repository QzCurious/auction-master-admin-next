import { type Metadata } from 'next';
import RouterLink from 'next/link';
import { PERMISSIONS_DATA } from '@/api/backend/rbac/permissions.data';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import { Link } from '@mui/material';
import Typography from '@mui/material/Typography/Typography';
import { Stack } from '@mui/system';

import { config } from '@/config';

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
  return <RoleForm permissions={PERMISSIONS_DATA} />;
}
