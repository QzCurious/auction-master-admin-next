'use server';

import { revalidateTag } from 'next/cache';
import { apiClient } from '@/api/apiClient';
import { withAuth } from '@/api/withAuth';

import { type Worker } from './GetWorkers';

type Data = 'Success';

type ErrorCode = never;

export async function DeleteWorker(id: Worker['id']) {
  const res = await withAuth(apiClient)<Data, ErrorCode>(`/workers/${id}`, {
    method: 'DELETE',
  });

  revalidateTag('workers');

  return res;
}
