'use server';

import { revalidateTag } from 'next/cache';
import { apiClient } from '@/api/apiClient';
import { throwIfInvalid } from '@/api/helpers/throwIfInvalid';
import { withAuth } from '@/api/withAuth';
import { z } from 'zod';

const ReqSchema = z.object({
  type: z.string(),
  url: z.string(),
  account: z.string(),
  name: z.string(),
  phone: z.string(),
  postalCode: z.string(),
  birthday: z.coerce.date(),
  email: z.literal('').or(z.string().email()),
  simCardNumber: z.string(),
  activationAt: z.coerce.date(),
  remark: z.string(),
  status: z.coerce.number(),
});

type Data = 'Success';

type ErrorCode = never;

export async function UpdateWorker(id: number, payload: z.input<typeof ReqSchema>) {
  const data = throwIfInvalid(payload, ReqSchema);

  const formData = new FormData();
  data.type != null && formData.append('type', data.type);
  data.url != null && formData.append('url', data.url);
  data.account != null && formData.append('account', data.account);
  data.name != null && formData.append('name', data.name);
  data.phone != null && formData.append('phone', data.phone);
  data.postalCode != null && formData.append('postalCode', data.postalCode);
  data.birthday != null && formData.append('birthday', data.birthday.toISOString());
  data.email != null && formData.append('email', data.email);
  data.simCardNumber != null && formData.append('simCardNumber', data.simCardNumber);
  data.activationAt != null && formData.append('activationAt', data.activationAt.toISOString());
  data.remark != null && formData.append('remark', data.remark);
  data.status != null && formData.append('status', data.status.toString());

  const res = await withAuth(apiClient)<Data, ErrorCode>(`/workers/${id}`, {
    method: 'PATCH',
    body: formData,
  });

  revalidateTag('workers');

  return res;
}
