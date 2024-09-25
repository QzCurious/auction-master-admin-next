'use server';

import { revalidatePath } from 'next/cache';
import { cookies } from 'next/headers';
import { appendEntries } from '@/domain/crud/appendEntries';
import { CookieConfigs } from "@/domain/auth/CookieConfigs";
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
  // block user
  | '1002'
  // PasswordIncorrect
  | '1004'
  // AdminNotExist
  | '1502';

export async function AdminLogin(payload: z.input<typeof ReqSchema>) {
  const data = throwIfInvalid(payload, ReqSchema);

  const urlencoded = new URLSearchParams();
  appendEntries(urlencoded, data);

  const res = await apiClient<Data, ErrorCode>('/backend/session', {
    method: 'POST',
    body: urlencoded,
  });

  if (res.error) {
    return res;
  }

  cookies().set(CookieConfigs.token.name, res.data.token, CookieConfigs.token.opts());
  cookies().set(CookieConfigs.refreshToken.name, res.data.refreshToken, CookieConfigs.refreshToken.opts());

  revalidatePath('/', 'layout');

  return res;
}
