'use server';

import { revalidateTag } from 'next/cache';
import { apiClient } from '@/api/apiClient';
import { throwIfInvalid } from '@/api/helpers/throwIfInvalid';
import { withAuth } from '@/api/withAuth';
import { z } from 'zod';

const ReqSchema = z.object({
  role: z.string(),
  description: z.string(),
});

type Data = 'Success';

type ErrorCode =
  // duplicate Role
  '1000';

export async function CreateRole(payload: z.input<typeof ReqSchema>) {
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
