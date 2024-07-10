'use client';

import type React from 'react';
import { createContext, useCallback, useContext } from 'react';
import { PERMISSION_MAP, type PermissionKey } from '@/api/backend/rbac/permissions.data';
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

export function useHandleNoPermissions(): (
  permissions: Array<PermissionKey>,
  opts?: { message?: string }
) => (e?: React.MouseEvent) => boolean;
export function useHandleNoPermissions(
  permissions: Array<PermissionKey>,
  opts?: { message?: string }
): (e?: React.MouseEvent) => boolean;
export function useHandleNoPermissions(permissions?: Array<PermissionKey>, opts?: { message?: string }) {
  const havePermissions = useHavePermissions();
  const { enqueueSnackbar } = useSnackbar();

  const handler = useCallback(
    (permissions: Array<PermissionKey>, opts?: { message?: string }) => (e?: React.MouseEvent) => {
      if (havePermissions(permissions)) {
        return false;
      }

      e?.preventDefault();
      enqueueSnackbar(
        <Stack spacing={1}>
          <Typography variant="body1">{opts?.message ?? <>你需要以下權限才能繼續</>}</Typography>
          <Stack direction="row" spacing={1}>
            {permissions
              .map((key) => PERMISSION_MAP[key].description)
              .map((permission) => (
                <Chip
                  key={permission}
                  label={permission}
                  variant="outlined"
                  sx={{ color: 'white' }}
                  onClick={() => copy(permission)}
                />
              ))}
          </Stack>
        </Stack>,
        { variant: 'default', persist: true }
      );
      return true;
    },
    [enqueueSnackbar, havePermissions]
  );

  const r = permissions ? handler(permissions) : handler;

  return r;
}
