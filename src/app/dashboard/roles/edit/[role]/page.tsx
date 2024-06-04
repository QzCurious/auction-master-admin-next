import { type Metadata } from 'next';
import { notFound } from 'next/navigation';
import { permissions } from '@/api/backend/rbac/permissions';
import { rolesPermissions } from '@/api/backend/rbac/rolesPermissions';

import { config } from '@/config';

import RoleForm from '../../RoleForm';

export const metadata = { title: `Create role | Dashboard | ${config.site.name}` } satisfies Metadata;

async function Page({ params }: { params: { role: string } }) {
  const [permissionsRes, rolesPermissionsRes] = await Promise.all([permissions(), rolesPermissions()]);
  const role = rolesPermissionsRes.data.find((role) => params.role === role.role);

  if (!role) {
    notFound();
  }

  return <RoleForm permissions={permissionsRes.data} role={role} />;
}

export default Page;
