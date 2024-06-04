import { type Metadata } from 'next';
import { roles } from '@/api/backend/rbac/roles';

import { config } from '@/config';

import AdminForm from '../AdminForm';

export const metadata = { title: `Create admin | Dashboard | ${config.site.name}` } satisfies Metadata;

async function Page() {
  const [rolesRes] = await Promise.all([roles()]);
  return <AdminForm roles={rolesRes.data} />;
}

export default Page;
