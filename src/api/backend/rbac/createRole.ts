import { revalidateTag } from 'next/cache';
import { apiClient } from '@/api/apiClient';
import { throwIfInvalid } from '@/api/helpers';
import { withAuth } from '@/api/withAuth';
import { z } from 'zod';

const ReqSchema = z.object({
  role: z.string(),
  description: z.string(),
});

export interface Role {
  role: string;
  description: string;
}

type Data = 'Success';

type ErrorCode = never;

export async function createRole(payload: z.input<typeof ReqSchema>) {
  throwIfInvalid(payload, ReqSchema);

  const formData = new FormData();
  formData.append('role', payload.role);
  formData.append('description', payload.description);

  const res = await withAuth(apiClient)<Data, ErrorCode>('/roles', {
    method: 'POST',
    body: formData,
  });

  revalidateTag('roles');

  return res;
}
