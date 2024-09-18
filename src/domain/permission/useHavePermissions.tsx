'use client';

import { useCallback, useContext } from 'react';

import { UserContext } from '../user/UserContext';
import type { PermissionKey, PermissionKeyField } from './types';

export function useHavePermissions() {
  const user = useContext(UserContext);

  const havePermissions = useCallback(
    (permissions: Array<PermissionKey> | Array<PermissionKeyField>) => {
      if (permissions.length === 0) {
        return true;
      }

      if (!user) return false;

      return permissions.every((permission) =>
        user.permissions.some((p) =>
          typeof permission === 'string'
            ? permission === p.key
            : permission.key === p.key && permission.field.every((f) => p.fields.includes(f))
        )
      );
    },
    [user]
  );

  return havePermissions;
}
