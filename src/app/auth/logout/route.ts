import { cookies } from 'next/headers';
import { redirect, RedirectType } from 'next/navigation';
import { CookieConfigs } from '@/domain/auth/CookieConfigs';

export async function GET() {
  cookies().delete(CookieConfigs.token.name);
  cookies().delete(CookieConfigs.refreshToken.name);
  redirect('/auth/sign-in', RedirectType.replace);
}
