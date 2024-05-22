import { apiClient } from '@/api/apiClient';
import { throwIfInvalid } from '@/api/helpers';
import { withAuth } from '@/api/withAuth';
import { z } from 'zod';

export interface Role {
  role: string;
  description: string;
}

type Data = 'Success';

type ErrorCode = never;

const ReqSchema = z.object({
  role: z.string(),
  url: z.string(),
  method: z.string(),
});
export async function removePermissionToRole(formData: FormData) {
  throwIfInvalid(formData, ReqSchema);

  // eslint-disable-next-line @typescript-eslint/no-unsafe-argument
  const query = new URLSearchParams(formData as any);
  const res = await withAuth(apiClient)<Data, ErrorCode>(`/permissions?${query.toString()}`, {
    method: 'DELETE',
  });

  return res;
}
