import { NextResponse, type NextRequest } from 'next/server';
import { invalidSessionError } from '@/api/errors';
import {
  afterRefreshDestination,
  refreshAttemptParam,
  safeReturnPath,
  signInDestination,
} from '@/domain/auth/navigation';
import { clearTokens } from '@/server/next/cookies';
import { createActionSession } from '@/server/next/createActionApi';

export async function GET(request: NextRequest) {
  const response = await refresh(request);
  response.headers.set('Cache-Control', 'no-store');
  return response;
}

async function refresh(request: NextRequest) {
  const returnPath = safeReturnPath(request.nextUrl.searchParams.get('goto'));
  if (new URL(returnPath, request.url).searchParams.has(refreshAttemptParam)) {
    return NextResponse.redirect(new URL(signInDestination(returnPath), request.url));
  }
  try {
    const session = createActionSession();
    await session.refresh();
    await session.persistTokens();
    return NextResponse.redirect(new URL(afterRefreshDestination(returnPath), request.url));
  } catch (error) {
    if (error === invalidSessionError) {
      const response = NextResponse.redirect(new URL(signInDestination(returnPath), request.url));
      clearTokens(response.cookies);
      return response;
    }
    return new NextResponse('Authentication service is temporarily unavailable. Please retry.', {
      status: 503,
      headers: { 'Cache-Control': 'no-store' },
    });
  }
}
