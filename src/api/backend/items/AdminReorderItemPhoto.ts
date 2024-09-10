'use server';

import { revalidateTag } from 'next/cache';
import { appendEntries } from '@/static';
import { z } from 'zod';

import { apiClient } from '../../apiClient';
import { throwIfInvalid } from '../../helpers/throwIfInvalid';
import { withAuth } from '../../withAuth';

const ReqSchema = z.object({
  originalSorted: z.number(),
  newSorted: z.number(),
});

type Data = 'Success';

type ErrorCode = never;

export async function AdminReorderItemPhoto(id: number, payload: z.input<typeof ReqSchema>) {
  const data = throwIfInvalid(payload, ReqSchema);

  const formData = new FormData();
  appendEntries(formData, data);

  const res = await withAuth(apiClient)<Data, ErrorCode>(`/items/${id}/photos`, {
    method: 'PATCH',
    body: formData,
  });

  revalidateTag('items');

  return res;
}
