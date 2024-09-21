import type React from 'react';
import { GetAdminPermissions } from '@/api/backend/rbac/GetAdminPermissions';

import { getUser } from '../auth/getToken';
import type { PermissionKey, PermissionKeyField } from './types';
import WithoutPermissionsError from './WithoutPermissionsError/WithoutPermissionsError';

export async function havePermissions(permissions: Array<PermissionKey> | Array<PermissionKeyField>) {
  const user = await getUser();
  if (!user) return false;

  const userPermissionsRes = await GetAdminPermissions(user.account);
  if (!userPermissionsRes.data) return false;

  const userPermissions = userPermissionsRes.data;

  return permissions.every((p) => {
    if (typeof p === 'string') {
      return p in userPermissions;
    }
    if (!(p.key in userPermissions)) {
      return false;
    }
    return p.fields.every((f) => userPermissions[p.key]?.fields.includes(f));
  });
}

export async function PermissionsGuard({
  permissions,
  children,
}: {
  permissions: Array<PermissionKey> | Array<PermissionKeyField>;
  children: React.ReactNode;
}) {
  const can = await havePermissions(permissions);

  if (!can)
    return <WithoutPermissionsError permissions={permissions.map((p) => (typeof p === 'string' ? p : p.key))} />;

  return <>{children}</>;
}
