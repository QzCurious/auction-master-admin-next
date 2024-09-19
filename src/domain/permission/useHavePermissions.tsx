'use client';

import { useCallback, useContext } from 'react';

import { PermissionsContext } from './PermissionsContext';
import type { PermissionKey, PermissionKeyField } from './types';

export function useHavePermissions() {
  const userPermissions = useContext(PermissionsContext);

  const havePermissions = useCallback(
    (permissions: Array<PermissionKey> | Array<PermissionKeyField>) => {
      if (permissions.length === 0) {
        return true;
      }

      if (!userPermissions) return false;

      return permissions.every((p) => {
        if (typeof p === 'string') {
          return p in userPermissions;
        }
        if (!(p.key in userPermissions)) {
          return false;
        }
        return p.field.every(userPermissions[p.key].fields.includes);
      });
    },
    [userPermissions]
  );

  return havePermissions;
}
