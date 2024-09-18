'use client';

import type React from 'react';

import { type PermissionKey, type PermissionKeyField } from './types';
import { useHavePermissions } from './useHavePermissions';

export function HavePermissionsOnly({
  children,
  permissionKeys,
}: {
  children: React.ReactNode;
  permissionKeys: Array<PermissionKey> | Array<PermissionKeyField>;
}) {
  const havePermissions = useHavePermissions();
  const permitted = havePermissions(permissionKeys);

  if (!permitted) {
    return null;
  }

  return children;
}
