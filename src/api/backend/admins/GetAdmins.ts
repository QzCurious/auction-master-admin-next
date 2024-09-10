'use server';

import { apiClient } from '@/api/apiClient';
import { throwIfInvalid } from '@/api/helpers/throwIfInvalid';
import { withAuth } from '@/api/withAuth';
import { appendEntries } from '@/static';
import { z } from 'zod';

import { type Role } from '../rbac/GetRoles';
import { type ADMIN_STATUS } from '../static-configs.data';

const ReqSchema = z.object({
  limit: z.number().min(1).default(10),
  offset: z.number().min(0).default(0),
});

export interface Admin {
  id: number;
  account: string;
  roles: Role['role'][];
  status: ADMIN_STATUS['value'];
  createdAt: string;
  updatedAt: string;
}

interface Data {
  admins: Admin[];
  count: number;
}

type ErrorCode = never;

export async function GetAdmins(payload: z.input<typeof ReqSchema>) {
  const data = throwIfInvalid(payload, ReqSchema);

  const query = new URLSearchParams();
  appendEntries(query, data);

  const res = await withAuth(apiClient)<Data, ErrorCode>(`/admins?${query.toString()}`, {
    method: 'GET',
    next: {
      tags: ['admins'],
    },
  });

  return res;
}
