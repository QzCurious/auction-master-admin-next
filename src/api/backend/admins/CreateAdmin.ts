'use server';

import { revalidateTag } from 'next/cache';
import { apiClient } from '@/api/apiClient';
import { throwIfInvalid } from '@/api/helpers/throwIfInvalid';
import { withAuth } from '@/api/withAuth';
import { z } from 'zod';

const ReqSchema = z.object({
  account: z.string(),
  password: z.string(),
});

type Data = 'Success';

type ErrorCode = never;

export async function CreateAdmin(payload: z.input<typeof ReqSchema>) {
  throwIfInvalid(payload, ReqSchema);

  const formData = new FormData();
  formData.append('account', payload.account);
  formData.append('password', payload.password);

  const res = await withAuth(apiClient)<Data, ErrorCode>('/admins', {
    method: 'POST',
    body: formData,
  });

  revalidateTag('admins');

  return res;
}
