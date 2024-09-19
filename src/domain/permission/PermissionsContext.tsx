'use client';

import type React from 'react';
import { createContext } from 'react';
import { type Permissions } from '@/api/backend/rbac/GetAdminPermissions';

export const PermissionsContext = createContext<Permissions | null>(null);

export function PermissionsContextProvider({
  permissions,
  children,
}: {
  permissions: Permissions;
  children: React.ReactNode;
}) {
  return <PermissionsContext.Provider value={permissions}>{children}</PermissionsContext.Provider>;
}
