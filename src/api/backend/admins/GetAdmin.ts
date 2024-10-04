'use server';

import { apiClient } from '@/api/apiClient';
import { withAuth } from '@/api/withAuth';
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

type ErrorCode = never;

export async function GetAdmin(id: number) {
  const res = await withAuth(apiClient)<Data, ErrorCode>(`/backend/admins/${id}`, {
    method: 'GET',
    next: {
      tags: ['admins'],
    },
  });

  return res;
}
