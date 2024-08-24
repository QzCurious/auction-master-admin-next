'use server';

import { apiClient } from './apiClient';
import { withAuth } from './withAuth';

interface Data {
  buying: number;
  selling: number;
}

type ErrorCode = never;

export async function GetJPYRates() {
  const res = await withAuth(apiClient)<Data, ErrorCode>('/jpy-rates', {
    method: 'GET',
    next: { tags: ['jpy-rates'] },
  });

  return res;
}
