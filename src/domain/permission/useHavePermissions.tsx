'use client';

import { useCallback, useContext } from 'react';

import { evaluatePermissions, type RequiredPermissions } from './evaluatePermissions';
import { PermissionsContext } from './PermissionsContext';

export function useHavePermissions() {
  const userPermissions = useContext(PermissionsContext);
  return useCallback(
    (permissions: RequiredPermissions) => evaluatePermissions(userPermissions, permissions),
    [userPermissions]
  );
}
