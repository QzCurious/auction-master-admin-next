'use server';

import { addPermissionsForRole } from '@/api/backend/rbac/addPermissionsForRole';
import { createRole } from '@/api/backend/rbac/createRole';
import { deletePermissionForRole } from '@/api/backend/rbac/deletePermissionForRole';

export async function createRoleAction(
  payload: Parameters<typeof createRole>[0] & Parameters<typeof addPermissionsForRole>[0]
) {
  {
    const res = await createRole(payload);
    if (res.error) {
      return `Failed to create role: ${res.error}`;
    }
    res.error satisfies null;
  }
  {
    const res = await addPermissionsForRole(payload);
    if (res.error) {
      return `Failed to add permissions: ${res.error}`;
    }
    res.error satisfies null;
  }
}

export async function updatePermissionsToRoleAction(payload: {
  role: string;
  addPermissions: string[];
  removePermissions: string[];
}) {
  const [addRes, removeRes] = await Promise.all([
    addPermissionsForRole({ role: payload.role, permissionKey: payload.addPermissions }),
    deletePermissionForRole({ role: payload.role, permissionKey: payload.removePermissions }),
  ]);

  if (!addRes.error && !removeRes.error) {
    return;
  }

  return [
    addRes.error && `Failed to add permissions: ${addRes.error}`,
    removeRes.error && `Failed to remove permissions: ${removeRes.error}`,
  ].filter(Boolean) as string[];
}
