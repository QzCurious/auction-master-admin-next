import { apiClient } from '@/api/apiClient';
import { throwIfInvalid } from '@/api/helpers';
import { withAuth } from '@/api/withAuth';
import { z } from 'zod';

const ReqSchema = z.object({
  role: z.string(),
  permissionID: z.number().array(),
});

export interface Role {
  role: string;
  description: string;
}

type Data = 'Success';

type ErrorCode = never;

export async function removePermissionToRole(payload: z.input<typeof ReqSchema>) {
  throwIfInvalid(payload, ReqSchema);

  const query = new URLSearchParams([
    ['role', payload.role],
    ...payload.permissionID.map((id) => ['permissionID', String(id)]),
  ]);
  const res = await withAuth(apiClient)<Data, ErrorCode>(`/permissions?${query.toString()}`, {
    method: 'DELETE',
  });

  return res;
}
