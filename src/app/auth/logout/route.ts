import { cookies } from 'next/headers';
import { redirect, RedirectType } from 'next/navigation';
import { cookieConfigs } from '@/static';

export async function GET() {
  cookies().delete(cookieConfigs.token.name);
  cookies().delete(cookieConfigs.refreshToken.name);
  redirect('/auth/sign-in', RedirectType.replace);
}
