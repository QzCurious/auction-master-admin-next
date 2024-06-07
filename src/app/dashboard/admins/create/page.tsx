import { type Metadata } from 'next';
import RouterLink from 'next/link';
import { roles } from '@/api/backend/rbac/roles';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import { Link } from '@mui/material';
import Typography from '@mui/material/Typography/Typography';
import { Stack } from '@mui/system';

import { config } from '@/config';
import RedirectAuthError from '@/components/RedirectAuthError';
import WithoutPermissionsError from '@/components/WithoutPermissionsError/WithoutPermissionsError';

import AdminForm from '../AdminForm';

export const metadata = { title: `Create admin | Dashboard | ${config.site.name}` } satisfies Metadata;

async function Page() {
  return (
    <>
      <Link component={RouterLink} href="/dashboard/admins">
        <Stack direction="row" alignItems="center" columnGap={1}>
          <ArrowBackIcon /> Admins
        </Stack>
      </Link>
      <Typography variant="h4" sx={{ mt: 3 }}>
        Create Admin
      </Typography>

      <Form />
    </>
  );
}

export default Page;

async function Form() {
  const [rolesRes] = await Promise.all([roles()]);

  if (rolesRes.error === '1001') {
    return <WithoutPermissionsError permissions={['GetRoles']} />;
  }

  if (rolesRes.error === '1003') {
    return <RedirectAuthError />;
  }

  return <AdminForm roles={rolesRes.data} />;
}
