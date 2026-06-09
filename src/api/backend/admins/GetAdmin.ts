'use server';

import { apiClientWithToken } from '@/api/core/apiClientWithToken';
import { createApiErrorServerSide } from '@/api/core/ApiError/createApiErrorServerSide';
import { type SuccessResponseJson } from '@/api/core/static';
import { type ADMIN_STATUS } from '@/domain/static/static-config-mappers';

import { type Role } from '../rbac/GetRoles';

export interface Admin {
  id: number;
  account: string;
  password: string;
  status: ADMIN_STATUS['value'];
  createdAt: string;
  updatedAt: string;
  roles: Array<Role['role']>;
}

interface Data extends Admin {}

export async function GetAdmin(id: number) {
  const res = await apiClientWithToken
    .get<SuccessResponseJson<Data>>(`backend/admins/${id}`, {
      next: {
        tags: ['admins'],
      },
    })
    .json()
    .catch(createApiErrorServerSide);

  return res;
}
