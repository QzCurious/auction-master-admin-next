import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';

export async function GET() {
  cookies().delete('token');
  cookies().delete('refreshToken');
  redirect('/auth/sign-in');
}
