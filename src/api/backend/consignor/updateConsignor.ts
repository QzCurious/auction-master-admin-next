'use server';

import { revalidateTag } from 'next/cache';
import { z } from 'zod';

import { apiClient } from '../../apiClient';
import { throwIfInvalid } from '../../helpers/throwIfInvalid';
import { withAuth } from '../../withAuth';

const ReqSchema = z.object({
  password: z.string().optional(),
  nickname: z.string().optional(),
});

type Data = 'Success';

type ErrorCode = never;

export async function updateConsignor(id: number, payload: z.input<typeof ReqSchema>) {
  const data = throwIfInvalid(payload, ReqSchema);

  const formData = new FormData();
  data.password && formData.append('password', data.password);
  data.nickname != null && formData.append('nickname', data.nickname);

  const res = await withAuth(apiClient)<Data, ErrorCode>(`/consignors/${id}`, {
    method: 'PATCH',
    body: formData,
  });

  revalidateTag('consignors');

  return res;
}
