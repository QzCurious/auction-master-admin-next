import { cookies } from 'next/headers';
import { redirect, RedirectType } from 'next/navigation';
import { clearTokens } from '@/server/next/cookies';

export async function GET() {
  clearTokens(cookies());
  redirect('/auth/sign-in', RedirectType.replace);
}
