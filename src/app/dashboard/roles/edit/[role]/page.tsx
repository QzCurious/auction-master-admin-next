import { notFound } from 'next/navigation';
import { permissions } from '@/api/backend/rbac/permissions';
import { rolesPermissions } from '@/api/backend/rbac/rolesPermissions';
import { redirectIfAuthError } from '@/utils/auth';

import RoleForm from '../../RoleForm';

async function Page({ params }: { params: { role: string } }) {
  const [permissionsRes, rolesPermissionsRes] = await Promise.all([permissions(), rolesPermissions()]);
  redirectIfAuthError(permissionsRes.error);
  redirectIfAuthError(rolesPermissionsRes.error);
  const role = rolesPermissionsRes.data.find((role) => params.role === role.role);

  if (!role) {
    notFound();
  }

  return <RoleForm permissions={permissionsRes.data} role={role} />;
}

export default Page;
