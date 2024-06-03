import { type Metadata } from 'next';
import { roles } from '@/api/backend/rbac/roles';
import { redirectIfAuthError } from '@/utils/auth';

import { config } from '@/config';

import AdminForm from '../AdminForm';

export const metadata = { title: `Create admin | Dashboard | ${config.site.name}` } satisfies Metadata;

async function Page() {
  const [rolesRes] = await Promise.all([roles()]);
  redirectIfAuthError(rolesRes.error);
  return <AdminForm roles={rolesRes.data} />;
}

export default Page;
