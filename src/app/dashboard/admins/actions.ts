'use server';

import { createAdmin } from '@/api/backend/admins/createAdmin';
import { updateAdmin } from '@/api/backend/admins/updateAdmin';
import { addRolesToAdmin } from '@/api/backend/rbac/addRolesForAdmin';
import { deleteRolesForAdmin } from '@/api/backend/rbac/deleteRolesForAdmin';

export async function createAdminAction(payload: { account: string; password: string; roles: string[] }) {
  const createAdminRes = await createAdmin({
    account: payload.account,
    password: payload.password,
  });

  if (createAdminRes.error) {
    return `Failed to create admin: ${createAdminRes.error}`;
  }

  const addRolesToAdminRes = await addRolesToAdmin(payload.account, { roles: payload.roles });

  if (addRolesToAdminRes.error) {
    return `Failed to add roles: ${addRolesToAdminRes.error}`;
  }
}

export async function updateAdminAction(payload: {
  id: number;
  account: string;
  password?: string;
  status: number;
  addRoles: string[];
  removeRoles: string[];
}) {
  const [updateAdminRes, addRolesToAdminRes, removeRolesFromAdminRes] = await Promise.all([
    updateAdmin(payload.id, { password: payload.password, status: payload.status }),
    addRolesToAdmin(payload.account, { roles: payload.addRoles }),
    deleteRolesForAdmin(payload.account, { roles: payload.removeRoles }),
  ]);

  if (!updateAdminRes.error && !addRolesToAdminRes.error && !removeRolesFromAdminRes.error) {
    return;
  }

  return [
    updateAdminRes.error && `Failed to update admin: ${updateAdminRes.error}`,
    addRolesToAdminRes.error && `Failed to add roles: ${addRolesToAdminRes.error}`,
    removeRolesFromAdminRes.error && `Failed to remove roles: ${removeRolesFromAdminRes.error}`,
  ].filter(Boolean) as string[];
}
