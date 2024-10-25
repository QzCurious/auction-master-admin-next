'use server';

import { apiClientWithToken } from '@/api/core/apiClientWithToken';
import { createApiErrorServerSide } from '@/api/core/ApiError/createApiErrorServerSide';
import { throwIfInvalid, type SuccessResponseJson } from '@/api/core/static';
import { appendEntries } from '@/domain/crud/appendEntries';
import { type ADMIN_STATUS } from '@/domain/static/static-config-mappers';
import { z } from 'zod';

import { type Role } from '../rbac/GetRoles';

const ReqSchema = z.object({
  limit: z.number().min(1).default(10),
  offset: z.number().min(0).default(0),
});

export interface Admin {
  id: number;
  account: string;
  password: string;
  status: ADMIN_STATUS['value'];
  createdAt: string;
  updatedAt: string;
  roles: Array<Role['role']>;
}

interface Data {
  admins: Admin[];
  count: number;
}

export async function GetAdmins(payload: z.input<typeof ReqSchema>) {
  const data = throwIfInvalid(payload, ReqSchema);

  const query = new URLSearchParams();
  appendEntries(query, data);

  const res = await apiClientWithToken
    .get<SuccessResponseJson<Data>>(`backend/admins?${query.toString()}`, {
      next: {
        tags: ['admins'],
      },
    })
    .json()
    .catch(createApiErrorServerSide);

  return res;
}
