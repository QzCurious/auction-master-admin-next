import { type Metadata } from 'next';
import { permissions } from '@/api/backend/rbac/permissions';
import { redirectAuthError } from '@/app/utils/redirectAuthError';

import { config } from '@/config';

import RoleForm from '../RoleForm';

export const metadata = { title: `Create role | Dashboard | ${config.site.name}` } satisfies Metadata;

async function Page() {
  const res = await permissions();
  redirectAuthError(res);

  return <RoleForm permissions={res.data} />;
}

export default Page;
