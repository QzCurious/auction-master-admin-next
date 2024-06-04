import { type Metadata } from 'next';
import { permissions } from '@/api/backend/rbac/permissions';

import { config } from '@/config';

import RoleForm from '../RoleForm';

export const metadata = { title: `Create role | Dashboard | ${config.site.name}` } satisfies Metadata;

async function Page() {
  const res = await permissions();

  return <RoleForm permissions={res.data} />;
}

export default Page;
