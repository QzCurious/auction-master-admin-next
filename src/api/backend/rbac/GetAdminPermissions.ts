/* eslint-disable import/named */
import { cache } from 'react';
import { apiClientWithToken } from '@/api/core/apiClientWithToken';
import { createApiErrorServerSide } from '@/api/core/ApiError/createApiErrorServerSide';
import { type SuccessResponseJson } from '@/api/core/static';
import { type PermissionKey } from '@/domain/permission/types';

import { type Admin } from '../admins/GetAdmins';

export type Permissions = Partial<Record<PermissionKey, { fields: Array<string> }>>;

type Data = Permissions;

async function GetAdminPermissions(account: Admin['account']) {
  const res = await apiClientWithToken
    .get<SuccessResponseJson<Data>>(`backend/permissions/${account}`, {
      next: {
        tags: ['roles', 'admins'],
      },
    })
    .json()
    .catch(createApiErrorServerSide);

  return res;
}

const CachedGetAdminPermissions = cache(GetAdminPermissions);

export { CachedGetAdminPermissions as GetAdminPermissions };
