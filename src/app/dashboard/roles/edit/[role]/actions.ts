'use server';

import { redirect } from 'next/navigation';
import { addPermissionsToRole } from '@/api/backend/rbac/addPermissionsToRole';
import { removePermissionToRole } from '@/api/backend/rbac/removePermissionFromRole';

export async function updatePermissionsToRoleAction(payload: {
  role: string;
  addPermissions: string[];
  removePermissions: string[];
}) {
  const [addRes, removeRes] = await Promise.all([
    addPermissionsToRole({ role: payload.role, permissionKey: payload.addPermissions }),
    removePermissionToRole({ role: payload.role, permissionKey: payload.removePermissions }),
  ]);

  addRes.error satisfies null;
  removeRes.error satisfies null;

  redirect('/dashboard/roles');
}
