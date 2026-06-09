import { type NextRequest } from 'next/server';
import { apiClientWithToken } from '@/api/core/apiClientWithToken';

export async function GET(request: NextRequest) {
  const query = request.nextUrl.searchParams;
  const res = await apiClientWithToken.get(`backend/shippings/excel?${query}`, {
    next: { tags: ['shippings'] },
  });

  return res;
}
