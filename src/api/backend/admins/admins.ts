'use server';

import { apiClient } from '@/api/apiClient';
import { throwIfInvalid } from '@/api/helpers/throwIfInvalid';
import { withAuth } from '@/api/withAuth';
import { z } from 'zod';

import { type Role } from '../rbac/roles';

const ReqSchema = z.object({
  limit: z.number().min(1).default(10),
  offset: z.number().min(0).default(0),
});

export interface Admin {
  id: number;
  account: string;
  roles: Role['role'][];
  /**
   * 1: active
   * 99: inactive
   */
  status: 1 | 99;
  createdAt: string;
  updatedAt: string;
}

interface Data {
  admins: Admin[];
  count: number;
}

type ErrorCode = never;

export async function admins(payload: z.input<typeof ReqSchema>) {
  throwIfInvalid(payload, ReqSchema);

  const query = new URLSearchParams({
    limit: payload.limit?.toString() || '10',
    offset: payload.offset?.toString() || '0',
  });
  const res = await withAuth(apiClient)<Data, ErrorCode>(`/admins?${query.toString()}`, {
    method: 'GET',
    next: {
      tags: ['admins'],
    },
  });

  return res;
}
