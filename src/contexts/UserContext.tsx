'use client';

import type React from 'react';
import { createContext, useCallback, useContext } from 'react';
import { type PermissionKey } from '@/api/backend/rbac/permissions';
import { type JwtPayload } from '@/api/JwtPayload';
import { Chip, Typography } from '@mui/material';
import { Stack } from '@mui/system';
import copy from 'copy-to-clipboard';
import { useSnackbar } from 'notistack';

export interface User extends Pick<JwtPayload, 'id' | 'account' | 'permissions'> {}

export const UserContext = createContext<User | null>(null);

export function UserContextProvider({ user, children }: { user: User | null; children: React.ReactNode }) {
  return <UserContext.Provider value={user}>{children}</UserContext.Provider>;
}

export function useHavePermissions() {
  const user = useContext(UserContext);

  const havePermissions = useCallback(
    (permissionKeys: Array<PermissionKey>) => {
      if (permissionKeys.length === 0) {
        return true;
      }

      return !!user && permissionKeys.every((permission) => user.permissions.includes(permission));
    },
    [user]
  );

  return havePermissions;
}

export function HavePermissionsOnly({
  children,
  permissionKeys,
}: {
  children: React.ReactNode;
  permissionKeys: Array<PermissionKey>;
}) {
  const havePermissions = useHavePermissions();
  const permitted = havePermissions(permissionKeys);

  if (!permitted) {
    return null;
  }

  return children;
}

export function useHandleNoPermissions() {
  const havePermissions = useHavePermissions();
  const { enqueueSnackbar } = useSnackbar();

  return useCallback(
    (permissions: Array<PermissionKey>, opts?: { message?: string; action?: string }) => (e?: React.MouseEvent) => {
      if (havePermissions(permissions)) {
        return false;
      }

      e?.preventDefault();
      enqueueSnackbar(
        <Stack alignItems="center" spacing={1} sx={{ p: 3 }}>
          <Typography variant="body1">
            {opts?.message ?? <>You need following permissions to {opts?.action ?? 'perform this action'}</>}
          </Typography>
          <Stack alignItems="center" direction="row" spacing={1}>
            {permissions.map((permission) => (
              <Chip key={permission} label={permission} variant="outlined" onClick={() => copy(permission)} />
            ))}
          </Stack>
        </Stack>,
        { variant: 'error', persist: true }
      );
      return true;
    },
    [enqueueSnackbar, havePermissions]
  );
}
