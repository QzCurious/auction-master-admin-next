import { type Metadata } from 'next';
import { notFound } from 'next/navigation';
import { getAdmin } from '@/api/backend/admins/getAdmin';
import { configs } from '@/api/backend/configs';
import { roles } from '@/api/backend/rbac/roles';

import { config } from '@/config';

import AdminForm from '../../AdminForm';

export const metadata = { title: `Edit admin | Dashboard | ${config.site.name}` } satisfies Metadata;

async function Page({ params }: { params: { id: string } }) {
  const [adminRes, configsRes, rolesRes] = await Promise.all([getAdmin(parseInt(params.id)), configs(), roles()]);

  if (!adminRes.data) {
    notFound();
  }

  return <AdminForm admin={adminRes.data} adminStatus={configsRes.data.adminStatus} roles={rolesRes.data} />;
}

export default Page;
