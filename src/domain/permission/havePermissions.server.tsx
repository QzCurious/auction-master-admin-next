import type React from 'react';
import { headers } from 'next/headers';
import { redirect } from 'next/navigation';
import { returnPathHeader, signInDestination } from '@/domain/auth/navigation';

import { getJwt } from '../auth/getJwt';
import { evaluatePermissions } from './evaluatePermissions';
import { loadPermissions } from './loadPermissions.server';
import type { PermissionKey, PermissionKeyField } from './types';
import WithoutPermissionsError from './WithoutPermissionsError/WithoutPermissionsError';

export async function havePermissions(permissions: Array<PermissionKey> | Array<PermissionKeyField>) {
  if (permissions.length === 0) return true;
  const jwt = await getJwt();
  if (!jwt) redirect(signInDestination(headers().get(returnPathHeader) ?? '/dashboard'));
  return evaluatePermissions(await loadPermissions(jwt.account), permissions);
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
