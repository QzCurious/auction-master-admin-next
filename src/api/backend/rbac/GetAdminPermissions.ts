// eslint-disable-next-line import/named
import { cache } from 'react';
import { apiClient } from '@/api/apiClient';
import { withAuth } from '@/api/withAuth';
import { type PermissionKey } from '@/domain/permission/types';

import { type Admin } from '../admins/GetAdmins';

export type Permissions = Partial<Record<PermissionKey, { fields: Array<string> }>>;

type Data = Permissions;

type ErrorCode = never;

async function GetAdminPermissions(account: Admin['account']) {
  const res = await withAuth(apiClient)<Data, ErrorCode>(`/backend/permissions/${account}`, {
    method: 'GET',
    next: {
      tags: ['roles', 'admins'],
    },
  });

  return res;
}

const CachedGetAdminPermissions = cache(GetAdminPermissions);

export { CachedGetAdminPermissions as GetAdminPermissions };
