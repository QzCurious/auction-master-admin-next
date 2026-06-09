'use client';

import type React from 'react';
import { useCallback } from 'react';
import { Chip, Typography } from '@mui/material';
import { Stack } from '@mui/system';
import copy from 'copy-to-clipboard';
import { useSnackbar } from 'notistack';

import { PERMISSION_MAP } from './permissions.data';
import { type PermissionKey } from './types';
import { useHavePermissions } from './useHavePermissions';

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
