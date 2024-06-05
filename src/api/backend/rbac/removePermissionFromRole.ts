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

export async function removePermissionToRole(payload: z.input<typeof ReqSchema>) {
  throwIfInvalid(payload, ReqSchema);

  const query = new URLSearchParams([
    ['role', payload.role],
    ...payload.permissionKey.map((id) => ['permissionKey', id]),
  ]);
  const res = await withAuth(apiClient)<Data, ErrorCode>(`/permissions?${query.toString()}`, {
    method: 'DELETE',
  });

  return res;
}
