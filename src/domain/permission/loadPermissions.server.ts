import 'server-only';

import { headers } from 'next/headers';
import { redirect } from 'next/navigation';
import { returnPathHeader, signInDestination } from '@/domain/auth/navigation';
import { GetAdminPermissions } from '@/server/next/queries/backend/rbac/GetAdminPermissions';

import { permissionResult } from './permissionResult';

export async function loadPermissions(account: string) {
  const result = permissionResult(await GetAdminPermissions(account));
  if (result.kind === 'unauthenticated') redirect(signInDestination(headers().get(returnPathHeader) ?? '/dashboard'));
  if (result.kind === 'unavailable') throw new Error('Unable to load permissions. Please try again.');
  return result.kind === 'loaded' ? result.permissions : null;
}
