import { type NextRequest } from 'next/server';
import { ExportShippings } from '@/api/endpoints/shippings/ExportShippings';
import { createActionApi } from '@/server/next/createActionApi';

export async function GET(request: NextRequest) {
  return ExportShippings(createActionApi().extend({ next: { tags: ['shippings'] } }), request.nextUrl.searchParams);
}
