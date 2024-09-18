'use server';

import { revalidateTag } from 'next/cache';
import { apiClient } from '@/api/apiClient';
import { throwIfInvalid } from '@/api/helpers/throwIfInvalid';
import { withAuth } from '@/api/withAuth';
import { z } from 'zod';

const ReqSchema = z.object({
  role: z.string(),
  permissionKey: z.string().array(),
});

type Data = 'Success';

type ErrorCode = never;

export async function AddPermissionForRole(payload: z.input<typeof ReqSchema>) {
  const data = throwIfInvalid(payload, ReqSchema);

  const d = {
    role: data.role,
    permissions: data.permissionKey.map((k) => ({
      key: k,
      fields: ['*'],
    })),
  };

  const res = await withAuth(apiClient)<Data, ErrorCode>('/permissions', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(d),
  });

  revalidateTag('roles');

  return res;
}
