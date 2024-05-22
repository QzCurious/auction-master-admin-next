import { redirect } from 'next/navigation';

export function redirectIfAuthError<E>(error: E): asserts error is Exclude<E, '1003'> {
  if (error === '1003') {
    if(process.env.NODE_ENV === 'development') {
      console.log('No auth, redirecting to sign in');
    }
    redirect('/auth/sign-in');
  }
}
