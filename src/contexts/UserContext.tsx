'use client';

import type React from 'react';
import { createContext, useCallback, useContext } from 'react';
import { type JwtPayload } from '@/api/JwtPayload';
import { type Permission } from '@/api/permissions.data';
import { Chip, Typography } from '@mui/material';
import { Stack } from '@mui/system';
import copy from 'copy-to-clipboard';
import { useSnackbar } from 'notistack';

export interface User extends Pick<JwtPayload, 'id' | 'account' | 'permissions'> {}

export const Ctx = createContext<User | null>(null);

export function UserContext({ user, children }: { user: User | null; children: React.ReactNode }) {
  return <Ctx.Provider value={user}>{children}</Ctx.Provider>;
}

export function useHavePermissions() {
  const user = useContext(Ctx);

  const havePermissions = useCallback(
    (permissions: Array<Permission>) =>
      user && permissions.every((permission) => user.permissions.includes(permission)),
    [user]
  );

  return havePermissions;
}

export function HavePermissionsOnly({
  children,
  permissions,
}: {
  children: React.ReactNode;
  permissions: Array<Permission>;
}) {
  const havePermissions = useHavePermissions();
  const permitted = havePermissions(permissions);

  if (!permitted) {
    return null;
  }

  return children;
}

export function useHandleNoPermissions() {
  const havePermissions = useHavePermissions();
  const { enqueueSnackbar } = useSnackbar();

  return useCallback(
    (permissions: Array<Permission>, opts?: { message?: string; action?: string }) => (e?: React.MouseEvent) => {
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
