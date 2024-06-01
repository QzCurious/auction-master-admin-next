import { type Metadata } from 'next';
import { notFound } from 'next/navigation';
import { getAdmin } from '@/api/backend/admins/getAdmin';
import { configs } from '@/api/backend/configs';
import { redirectIfAuthError } from '@/utils/auth';

import { config } from '@/config';

import AdminForm from '../../AdminForm';

export const metadata = { title: `Edit admin | Dashboard | ${config.site.name}` } satisfies Metadata;

async function Page({ params }: { params: { id: string } }) {
  const [adminRes, configsRes] = await Promise.all([getAdmin(parseInt(params.id)), configs()]);
  redirectIfAuthError(adminRes.error);
  redirectIfAuthError(configsRes.error);

  if (!adminRes.data) {
    notFound();
  }

  return <AdminForm admin={adminRes.data} adminStatus={configsRes.data.adminStatus} />;
}

export default Page;
