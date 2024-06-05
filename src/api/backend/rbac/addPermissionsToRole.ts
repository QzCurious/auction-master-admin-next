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

export async function addPermissionsToRole(payload: z.input<typeof ReqSchema>) {
  throwIfInvalid(payload, ReqSchema);

  const formData = new FormData();
  formData.append('role', payload.role);
  for (const id of payload.permissionKey) {
    formData.append('permissionKey', id);
  }

  const res = await withAuth(apiClient)<Data, ErrorCode>('/permissions', {
    method: 'POST',
    body: formData,
  });

  return res;
}
