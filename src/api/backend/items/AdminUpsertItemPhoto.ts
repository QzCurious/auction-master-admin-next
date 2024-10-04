'use server';

import { revalidateTag } from 'next/cache';

import { apiClient } from '../../apiClient';
import { withAuth } from '../../withAuth';

type Data = 'Success';

type ErrorCode = never;

export async function AdminUpsertItemPhoto(id: number, formData: FormData) {
  if (formData.getAll('photo').length === 0) {
    throw new Error('photo is required and should be an array of files');
  }
  if (formData.getAll('sorted').length !== formData.getAll('photo').length) {
    throw new Error('photo and sorted should have the same length');
  }

  const res = await withAuth(apiClient)<Data, ErrorCode>(`/backend/items/${id}/photos`, {
    method: 'POST',
    body: formData,
  });

  revalidateTag('items');

  return res;
}
