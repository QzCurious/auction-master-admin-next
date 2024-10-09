import { type NextRequest } from 'next/server';
import { getToken } from '@/domain/auth/getToken';

export async function GET(request: NextRequest) {
  const { token } = await getToken();
  const query = request.nextUrl.searchParams;
  const res = await fetch(`${process.env.API_BASE_URL}/backend/shippings/excel?${query}`, {
    method: 'GET',
    headers: {
      Authorization: `Bearer ${token}`,
    },
    next: { tags: ['shippings'] },
  });

  return res;
}
