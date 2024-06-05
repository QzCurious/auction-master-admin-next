import { type ApiClientResponse } from '@/api/apiClient';
import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';

type AuthErrorApiClientResponse = ApiClientResponse<any, '1001' | '1003'>;
export function redirectAuthError<T extends AuthErrorApiClientResponse>(
  res: AuthErrorApiClientResponse
): asserts res is Exclude<T, { error: '1001' | '1003' }> {
  if (res.error === '1001') {
    revalidatePath('/', 'layout');
    redirect('/dashboard');
  }
  if (res.error === '1003') {
    revalidatePath('/', 'layout');
    redirect('/auth/sign-in');
  }
  return res as any;
}
