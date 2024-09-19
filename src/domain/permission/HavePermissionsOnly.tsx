'use client';

import type React from 'react';

import { type PermissionKey, type PermissionKeyField } from './types';
import { useHavePermissions } from './useHavePermissions';

export function HavePermissionsOnly({
  children,
  permissions,
}: {
  children: React.ReactNode;
  permissions: Array<PermissionKey> | Array<PermissionKeyField>;
}) {
  const havePermissions = useHavePermissions();
  const permitted = havePermissions(permissions);

  if (!permitted) {
    return null;
  }

  return children;
}
