'use server';

import { revalidateTag } from 'next/cache';
import { appendEntries } from '@/domain/crud/appendEntries';
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

  const urlencoded = new URLSearchParams();
  appendEntries(urlencoded, data);

  const res = await withAuth(apiClient)<Data, ErrorCode>(`/backend/items/${id}/photos`, {
    method: 'PATCH',
    body: urlencoded,
  });

  revalidateTag('items');

  return res;
}
