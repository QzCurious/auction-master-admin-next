'use server';

import { revalidatePath } from 'next/cache';
import { cookies } from 'next/headers';
import { z } from 'zod';

import { apiClient } from './apiClient';
import { throwIfInvalid } from './helpers/throwIfInvalid';

const ReqSchema = z.object({
  account: z.string().min(1, 'Account is required'),
  password: z.string().min(1, 'Password is required'),
});

interface Data {
  token: string;
  refreshToken: string;
}

type ErrorCode =
  // PermissionDenied
  | '1001'
  // PasswordIncorrect
  | '1004'
  // AdminNotExist
  | '1502';

export async function session(payload: z.input<typeof ReqSchema>) {
  throwIfInvalid(payload, ReqSchema);

  const formData = new FormData();
  formData.append('account', payload.account);
  formData.append('password', payload.password);

  const res = await apiClient<Data, ErrorCode>('/session', {
    method: 'POST',
    body: formData,
  });

  if (res.error) {
    return res;
  }

  cookies().set('token', res.data.token, {
    expires: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000), // 14 days
    httpOnly: true,
    sameSite: 'strict',
    // secure: process.env.NODE_ENV === 'production',
  });
  cookies().set('refreshToken', res.data.refreshToken, {
    expires: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000), // 14 days
    httpOnly: true,
    sameSite: 'strict',
    // secure: process.env.NODE_ENV === 'production',
  });

  revalidatePath('/', 'layout');

  return res;
}
