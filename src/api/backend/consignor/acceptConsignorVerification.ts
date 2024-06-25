'use server';

import { revalidateTag } from 'next/cache';
import { z } from 'zod';

import { apiClient } from '../../apiClient';
import { throwIfInvalid } from '../../helpers/throwIfInvalid';
import { withAuth } from '../../withAuth';

const ReqSchema = z.object({
  name: z.string().min(1),
  identification: z.string().min(1),
});

export type Data = 'Success';

// 1005: name incorrect, 1006: identification incorrect
export type ErrorCode = '1005' | '1006';

export async function acceptConsignorVerification(id: number, payload: z.input<typeof ReqSchema>) {
  const data = throwIfInvalid(payload, ReqSchema);

  const formData = new FormData();
  data.name && formData.append('name', data.name);
  data.identification && formData.append('identification', data.identification);

  const res = await withAuth(apiClient)<Data, ErrorCode>(`/consignors/verifications/${id}/approve`, {
    method: 'POST',
    body: formData,
  });

  revalidateTag('consignorVerifications');

  return res;
}
